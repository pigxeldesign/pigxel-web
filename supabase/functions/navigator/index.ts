/**
 * Navigator Edge Function — /functions/v1/navigator
 *
 * Accepts a chat history and runs a tool-calling loop against OpenRouter.
 * Returns a clean JSON response for the frontend chat UI.
 */

import { corsHeaders } from '../_shared/cors.ts';
import { chatCompletion } from './openrouter.ts';
import { executeTool, toolDefinitions } from './tools.ts';
import type { ChatMessage, NavigatorRequest, NavigatorResponse, NavigatorSource } from './types.ts';

// ──────────────────────────────────────────────
//  System prompt
// ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Web3 Navigator, an AI assistant built into the Pigxel dApp directory.
Your job is to help users discover the best Web3 applications for their needs.

## Rules
1. ALWAYS use the provided tools to search the directory before answering. Never guess dApp details.
2. Rank results by relevance and rating. Present the top 2-3 options max unless asked for more.
3. ALWAYS include the live_url for each dApp you recommend.
4. Format recommendations clearly: name, one-sentence description, URL.
5. If multiple results exist, briefly explain what makes each one different.
6. For follow-up questions about a specific dApp, use get_dapp_by_id with the id from the earlier search.
7. If directory tools return no results, use search_web and clearly tell the user: "This isn't in our directory, but here's what I found on the web:".
8. Keep answers short, practical, and beginner-friendly. Avoid jargon unless the user uses it first.
9. Never invent data. If something is missing in the directory, say so honestly.
10. Ask a brief clarification question ONLY if the request is too vague to search (e.g. "What do you want to do with Web3?").`;

// ──────────────────────────────────────────────
//  Tool-calling loop
// ──────────────────────────────────────────────

const MAX_TOOL_ROUNDS = 5; // prevent infinite loops

async function runNavigator(
  userMessages: ChatMessage[],
): Promise<{ reply: string; sources: NavigatorSource[] }> {
  // Build full message array with system prompt
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...userMessages,
  ];

  const allSources: NavigatorSource[] = [];
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const response = await chatCompletion(messages, toolDefinitions);
    const choice = response.choices[0];

    if (!choice) {
      throw new Error('OpenRouter returned no choices.');
    }

    const assistantMessage = choice.message;
    messages.push({
      role: 'assistant',
      content: assistantMessage.content ?? null,
      tool_calls: assistantMessage.tool_calls,
    });

    // If finish_reason is 'stop' (or no tool calls), we have the final answer
    if (
      choice.finish_reason === 'stop' ||
      !assistantMessage.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      return {
        reply: assistantMessage.content ?? 'Sorry, I could not generate a response.',
        sources: allSources,
      };
    }

    // Execute all tool calls in this round (can be parallel)
    const toolResults = await Promise.all(
      assistantMessage.tool_calls.map(async (tc) => {
        const result = await executeTool(tc.function.name, tc.function.arguments);
        // Accumulate sources
        allSources.push(...result.sources);
        return {
          toolCallId: tc.id,
          name: tc.function.name,
          content: result.content,
        };
      }),
    );

    // Append tool results to message history
    for (const tr of toolResults) {
      messages.push({
        role: 'tool',
        tool_call_id: tr.toolCallId,
        name: tr.name,
        content: tr.content,
      });
    }
    // Loop continues — model will now form its final answer
  }

  // If we hit the max rounds, return whatever the last assistant message was
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  return {
    reply:
      lastAssistant?.content ??
      'I ran into a processing loop. Please try a simpler question.',
    sources: allSources,
  };
}

// ──────────────────────────────────────────────
//  Edge Function handler
// ──────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let body: NavigatorRequest;
    try {
      body = (await req.json()) as NavigatorRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Request must include a non-empty messages array.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Run the AI tool-calling loop
    const { reply, sources } = await runNavigator(body.messages);

    const responseBody: NavigatorResponse = { reply, sources };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Navigator] Unhandled error:', err);

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
