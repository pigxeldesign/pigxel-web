/**
 * navigatorApi.ts
 * Typed wrapper around the Supabase Edge Function /functions/v1/navigator.
 */

const NAVIGATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/navigator`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ──────────────────────────────────────────────
//  Shared types (mirrors the Edge Function types)
// ──────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  role: MessageRole;
  content: string | null;
}

export interface NavigatorSource {
  name: string;
  url: string;
  type: 'dapp' | 'web';
}

export interface NavigatorResponse {
  reply: string;
  sources: NavigatorSource[];
}

// ──────────────────────────────────────────────
//  API call
// ──────────────────────────────────────────────

/**
 * Send the full chat history to the Navigator Edge Function and return the
 * assistant's reply with any cited sources.
 *
 * @param messages  Conversation history (user + assistant turns only — no system messages).
 * @returns         The assistant reply and an array of sources (dapp or web).
 */
export async function sendNavigatorMessage(
  messages: ChatMessage[],
): Promise<NavigatorResponse> {
  const response = await fetch(NAVIGATOR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    let errorMessage = `Navigator API error (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as NavigatorResponse;
}
