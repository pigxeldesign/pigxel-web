import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  user_type: 'admin' | 'general_user' | 'premium_user';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  sub_categories: string[];
  created_at: string;
  updated_at: string;
}

export interface DApp {
  id: string;
  name: string;
  description: string;
  problem_solved: string;
  logo_url?: string;
  thumbnail_url?: string;
  category_id?: string;
  sub_category: string;
  blockchains: string[];
  rating?: number;
  user_count?: string;
  is_new?: boolean;
  is_featured?: boolean;
  live_url: string;
  github_url?: string;
  twitter_url?: string;
  documentation_url?: string;
  discord_url?: string;
  founded?: string;
  team?: string;
  total_value_locked?: string;
  daily_active_users?: string;
  transactions?: string;
  audits?: string[];
  licenses?: string[];
  created_at: string;
  updated_at: string;
}

export interface Flow {
  id: string;
  dapp_id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  screen_count: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlowScreen {
  id: string;
  flow_id: string;
  order_index: number;
  thumbnail_url: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}