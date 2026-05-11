/**
 * Shared TypeScript types for the Navigator Edge Function.
 */

// ──────────────────────────────────────────────
//  Chat message types (OpenAI-compatible)
// ──────────────────────────────────────────────

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ChatMessage {
  role: Role;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string; // for role === 'tool'
  name?: string;         // for role === 'tool'
}

// ──────────────────────────────────────────────
//  Directory data types (mirrors Postgres schema)
// ──────────────────────────────────────────────

export interface DAppSummary {
  id: string;
  name: string;
  description: string;
  sub_category: string;
  blockchains: string[];
  rating: number | null;
  user_count: string | null;
  live_url: string;
  category_title: string | null;
}

export interface DAppDetail extends DAppSummary {
  problem_solved: string;
  logo_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  documentation_url: string | null;
  discord_url: string | null;
  founded: string | null;
  team: string | null;
  total_value_locked: string | null;
  daily_active_users: string | null;
  transactions: string | null;
  audits: string[];
  is_featured: boolean;
  is_new: boolean;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  title: string;
  description: string;
  sub_categories: string[];
}

// ──────────────────────────────────────────────
//  API request / response types
// ──────────────────────────────────────────────

export interface NavigatorRequest {
  messages: ChatMessage[]; // full history including the latest user message
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
