/**
 * Tool definitions and executor functions for the Navigator.
 *
 * Tools:
 *  1. search_dapps       — full-text search across name / description / sub_category
 *  2. get_dapp_by_id     — full detail for a single dApp
 *  3. list_categories    — all categories with slugs
 *  4. search_web         — fallback web search via Jina.ai (free, no API key needed)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { ToolDefinition } from './openrouter.ts';
import type {
  CategoryInfo,
  DAppDetail,
  DAppSummary,
  NavigatorSource,
} from './types.ts';

// ──────────────────────────────────────────────
//  Supabase admin client (uses service role key)
//  Safe inside an Edge Function — never exposed to browser.
// ──────────────────────────────────────────────
function getSupabase() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(url, key);
}

// ──────────────────────────────────────────────
//  Tool JSON Schema definitions
// ──────────────────────────────────────────────

export const toolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_dapps',
      description:
        'Search the directory for dApps matching a keyword. Returns ranked results with title, description, category, rating, and direct URL. Use this whenever the user asks about finding apps, recommendations, or specific use cases.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search term — can be a use case, protocol name, or topic (e.g. "yield", "NFT marketplace", "lending").',
          },
          category_slug: {
            type: 'string',
            description:
              'Optional category slug to narrow the search (e.g. "defi", "nft"). Leave empty to search all categories.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return. Default 5, max 10.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_dapp_by_id',
      description:
        'Retrieve full details for a single dApp by its UUID. Use this for follow-up questions about a specific app already mentioned in the conversation.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The UUID of the dApp from a previous search_dapps result.',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_categories',
      description:
        'List all top-level categories in the directory (e.g. DeFi, NFT, Gaming). Use this when the user asks what categories or types of dApps are available.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description:
        'Search the web for information NOT available in the directory. Use this ONLY when directory tools return no results or the user asks about something clearly outside the directory (e.g. news, regulations, general Web3 concepts). Always mention to the user that this is a web result, not from the directory.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query to send to the web.',
          },
        },
        required: ['query'],
      },
    },
  },
];

// ──────────────────────────────────────────────
//  Tool executor
// ──────────────────────────────────────────────

export interface ToolResult {
  content: string;          // JSON string returned to the LLM
  sources: NavigatorSource[]; // structured sources for the UI
}

export async function executeTool(
  name: string,
  argsJson: string,
): Promise<ToolResult> {
  const args = JSON.parse(argsJson);

  switch (name) {
    case 'search_dapps':
      return await searchDapps(
        args.query as string,
        args.category_slug as string | undefined,
        Math.min(args.limit ?? 5, 10),
      );

    case 'get_dapp_by_id':
      return await getDappById(args.id as string);

    case 'list_categories':
      return await listCategories();

    case 'search_web':
      return await searchWeb(args.query as string);

    default:
      return {
        content: JSON.stringify({ error: `Unknown tool: ${name}` }),
        sources: [],
      };
  }
}

// ──────────────────────────────────────────────
//  Individual tool implementations
// ──────────────────────────────────────────────

async function searchDapps(
  query: string,
  categorySlug?: string,
  limit = 5,
): Promise<ToolResult> {
  const sb = getSupabase();

  // Build base query with category join
  let q = sb
    .from('dapps')
    .select(
      `id, name, description, sub_category, blockchains, rating, user_count, live_url,
       categories!dapps_category_id_fkey ( title, slug )`,
    )
    .or(
      `name.ilike.%${query}%,description.ilike.%${query}%,sub_category.ilike.%${query}%,problem_solved.ilike.%${query}%`,
    )
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit);

  // Filter by category if provided
  if (categorySlug) {
    // First resolve category slug → id
    const { data: catData } = await sb
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (catData?.id) {
      q = q.eq('category_id', catData.id);
    }
  }

  const { data, error } = await q;

  if (error) {
    return {
      content: JSON.stringify({ error: error.message }),
      sources: [],
    };
  }

  if (!data || data.length === 0) {
    return {
      content: JSON.stringify({ results: [], message: 'No dApps found for this query.' }),
      sources: [],
    };
  }

  // Shape results for LLM consumption
  const results = data.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    sub_category: d.sub_category,
    blockchains: d.blockchains,
    rating: d.rating,
    user_count: d.user_count,
    live_url: d.live_url,
    category_title: d.categories?.title ?? null,
  })) as DAppSummary[];

  const sources: NavigatorSource[] = results.map((r) => ({
    name: r.name,
    url: r.live_url,
    type: 'dapp',
  }));

  return {
    content: JSON.stringify({ results }),
    sources,
  };
}

async function getDappById(id: string): Promise<ToolResult> {
  const sb = getSupabase();

  const { data, error } = await sb
    .from('dapps')
    .select(
      `id, name, description, problem_solved, sub_category, blockchains, rating,
       user_count, live_url, github_url, twitter_url, documentation_url, discord_url,
       founded, team, total_value_locked, daily_active_users, transactions, audits,
       is_featured, is_new,
       categories!dapps_category_id_fkey ( title, slug )`,
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    return {
      content: JSON.stringify({ error: error?.message ?? 'Not found.' }),
      sources: [],
    };
  }

  const dapp: DAppDetail = {
    id: data.id,
    name: data.name,
    description: data.description,
    problem_solved: data.problem_solved,
    sub_category: data.sub_category,
    blockchains: data.blockchains,
    rating: data.rating,
    user_count: data.user_count,
    live_url: data.live_url,
    github_url: data.github_url,
    twitter_url: data.twitter_url,
    documentation_url: data.documentation_url,
    discord_url: data.discord_url,
    founded: data.founded,
    team: data.team,
    total_value_locked: data.total_value_locked,
    daily_active_users: data.daily_active_users,
    transactions: data.transactions,
    audits: data.audits ?? [],
    is_featured: data.is_featured,
    is_new: data.is_new,
    category_title: (data as any).categories?.title ?? null,
    logo_url: null,
  };

  return {
    content: JSON.stringify({ dapp }),
    sources: [{ name: dapp.name, url: dapp.live_url, type: 'dapp' }],
  };
}

async function listCategories(): Promise<ToolResult> {
  const sb = getSupabase();

  const { data, error } = await sb
    .from('categories')
    .select('id, slug, title, description, sub_categories')
    .order('title', { ascending: true });

  if (error) {
    return {
      content: JSON.stringify({ error: error.message }),
      sources: [],
    };
  }

  const categories = (data ?? []) as CategoryInfo[];

  return {
    content: JSON.stringify({ categories }),
    sources: [],
  };
}

async function searchWeb(query: string): Promise<ToolResult> {
  // Jina.ai /search is free, returns clean markdown — no API key required.
  const encodedQuery = encodeURIComponent(query);
  const url = `https://s.jina.ai/${encodedQuery}`;

  try {
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!resp.ok) {
      throw new Error(`Jina search returned ${resp.status}`);
    }

    const json = await resp.json();

    // Jina returns { data: [{ title, url, content }] }
    const items: Array<{ title: string; url: string; content: string }> =
      json?.data ?? [];

    const topItems = items.slice(0, 3);

    const sources: NavigatorSource[] = topItems.map((item) => ({
      name: item.title ?? 'Web result',
      url: item.url ?? '',
      type: 'web',
    }));

    const summary = topItems
      .map(
        (item, i) =>
          `[${i + 1}] **${item.title}** (${item.url})\n${item.content?.slice(0, 400)}`,
      )
      .join('\n\n');

    return {
      content: JSON.stringify({
        web_results: topItems.map((i) => ({
          title: i.title,
          url: i.url,
          snippet: i.content?.slice(0, 400),
        })),
        summary,
      }),
      sources,
    };
  } catch (err) {
    return {
      content: JSON.stringify({
        error: `Web search failed: ${(err as Error).message}`,
      }),
      sources: [],
    };
  }
}
