/**
 * Thin OpenRouter client — OpenAI-compatible HTTP.
 * Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from Deno env.
 *
 * Fallback cascade: if the primary model is rate-limited (429),
 * automatically tries backup models in order before giving up.
 */

import type { ChatMessage, ToolCall } from './types.ts';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// ──────────────────────────────────────────────
//  Exported types
// ──────────────────────────────────────────────

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenRouterChoice {
  message: {
    role: 'assistant';
    content: string | null;
    tool_calls?: ToolCall[];
  };
  finish_reason: string;
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

// ──────────────────────────────────────────────
//  Fallback model cascade
//  All verified to support tool calling (2026-05)
// ──────────────────────────────────────────────

const FREE_FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-coder:free',
  'openai/gpt-oss-20b:free',
];

// ──────────────────────────────────────────────
//  Internal: try a single model
// ──────────────────────────────────────────────

/**
 * Attempt one chat completion against a specific model.
 * Returns the response object, or `null` if rate-limited (429).
 * Throws for all other non-OK statuses.
 */
async function tryModel(
  model: string,
  body: Record<string, unknown>,
  apiKey: string,
): Promise<OpenRouterResponse | null> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pigxel.design',
      'X-Title': 'Pigxel Web3 Navigator',
    },
    body: JSON.stringify({ ...body, model }),
  });

  if (response.status === 429) {
    console.warn(`[OpenRouter] ${model} → 429. Moving to next fallback…`);
    return null; // signal: try next model
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as OpenRouterResponse;
}

// ──────────────────────────────────────────────
//  Public: chatCompletion with fallback cascade
// ──────────────────────────────────────────────

/**
 * Send a chat request to OpenRouter.
 *
 * Strategy:
 * 1. Try the primary model (from OPENROUTER_MODEL env var).
 * 2. On 429, immediately try each fallback model in FREE_FALLBACK_MODELS.
 * 3. If every model is rate-limited, wait 3 s and retry the primary once more.
 * 4. If still failing, throw a user-friendly error.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  tools: ToolDefinition[],
): Promise<OpenRouterResponse> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set.');
  }

  const primaryModel =
    Deno.env.get('OPENROUTER_MODEL') ?? 'meta-llama/llama-3.3-70b-instruct:free';

  // Build the cascade: primary first, then unique fallbacks
  const modelCascade = [
    primaryModel,
    ...FREE_FALLBACK_MODELS.filter((m) => m !== primaryModel),
  ];

  const body: Record<string, unknown> = {
    messages,
    tools: tools.length > 0 ? tools : undefined,
    tool_choice: tools.length > 0 ? 'auto' : undefined,
    temperature: 0.3,
    max_tokens: 1024,
  };

  // Pass 1 — try each model without waiting
  for (const model of modelCascade) {
    const result = await tryModel(model, body, apiKey);
    if (result !== null) {
      if (model !== primaryModel) {
        console.log(`[OpenRouter] Served by fallback: ${model}`);
      }
      return result;
    }
  }

  // Pass 2 — all models 429'd; wait 3 s and do one final attempt on primary
  console.warn('[OpenRouter] All models rate-limited. Waiting 3 s…');
  await new Promise((r) => setTimeout(r, 3000));

  const finalResult = await tryModel(primaryModel, body, apiKey);
  if (finalResult !== null) return finalResult;

  throw new Error(
    'The AI is temporarily unavailable due to high demand on the free tier. Please try again in a few seconds.',
  );
}
