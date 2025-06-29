import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    anonKey: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

console.log('Supabase configuration:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'web3-dapp-explorer'
    }
  }
});

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

/**
 * Validates if a URL is safe (not using javascript: or other potentially dangerous protocols)
 * @param url The URL to validate
 * @returns boolean indicating if the URL is safe
 */
export function isValidSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Determines if the application is running in production mode
 * @returns boolean indicating if in production
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production';
}

/**
 * Checks if the current user is authenticated with admin privileges
 * Uses the check_auth_status RPC function for a reliable check
 */
export async function checkAuthStatus() {
  try {
    const { data, error } = await supabase.rpc('check_auth_status');
    if (error) {
      console.error('Auth status check error:', error);
      return { isAuthenticated: false, isAdmin: false, error: error.message };
    }
    return {
      isAuthenticated: data.is_authenticated,
      userId: data.user_id,
      isAdmin: data.is_admin,
      error: null
    };
  } catch (error) {
    console.error('Unexpected auth check error:', error);
    return { isAuthenticated: false, isAdmin: false, error: String(error) };
  }
}

/**
 * Direct table insert for dApps - bypasses RPC functions
 */
export async function directTableInsert(dappData: any) {
  console.log('Attempting direct table insert', dappData);
  
  try {
    // Create a clean data object with only the fields we need
    const cleanData = {
      name: dappData.name,
      description: dappData.description,
      problem_solved: dappData.problem_solved,
      logo_url: dappData.logo_url || null,
      thumbnail_url: dappData.thumbnail_url || null,
      category_id: dappData.category_id || null,
      sub_category: dappData.sub_category || '',
      blockchains: Array.isArray(dappData.blockchains) ? dappData.blockchains : [],
      is_new: Boolean(dappData.is_new),
      is_featured: Boolean(dappData.is_featured),
      live_url: dappData.live_url,
      github_url: dappData.github_url || null,
      twitter_url: dappData.twitter_url || null,
      documentation_url: dappData.documentation_url || null,
      discord_url: dappData.discord_url || null
    };
    
    // Insert directly into the dapps table
    const { data, error } = await supabase
      .from('dapps')
      .insert([cleanData])
      .select('id')
      .single();
      
    if (error) {
      console.error('Direct table insert failed:', error);
      return { data: null, error };
    }
    
    return { 
      data: { 
        success: true, 
        id: data.id, 
        message: 'dApp created successfully via direct table insert' 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error during direct table insert:', error);
    return { data: null, error };
  }
}

/**
 * Try simple RPC function for inserting dApps
 */
export async function simpleInsertDApp(dappData: any) {
  console.log('Attempting simple_insert_dapp RPC', dappData);
  
  try {
    const { data, error } = await supabase.rpc(
      'simple_insert_dapp',
      { p_dapp_data: dappData }
    );
    
    if (error) {
      console.error('simple_insert_dapp RPC failed:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error during simple_insert_dapp RPC:', error);
    return { data: null, error };
  }
}

/**
 * Directly inserts a dApp as a fallback method
 */
export async function directInsertDApp(dappData: any) {
  try {
    // First attempt with RPC function
    const { data, error } = await supabase.rpc('simple_insert_dapp', {
      p_dapp_data: dappData
    });
    
    if (!error) {
      return { data, error: null };
    }
    
    console.error('simple_insert_dapp failed, falling back to direct insert:', error);
    
    // Fallback to direct insert
    const { data: insertData, error: insertError } = await supabase
      .from('dapps')
      .insert([{
        name: dappData.name,
        description: dappData.description,
        problem_solved: dappData.problem_solved,
        logo_url: dappData.logo_url || null,
        thumbnail_url: dappData.thumbnail_url || null,
        category_id: dappData.category_id || null,
        sub_category: dappData.sub_category || '',
        blockchains: Array.isArray(dappData.blockchains) ? dappData.blockchains : [],
        is_new: Boolean(dappData.is_new),
        is_featured: Boolean(dappData.is_featured),
        live_url: dappData.live_url
      }])
      .select('id')
      .single();
      
    if (insertError) {
      console.error('Direct insert also failed:', insertError);
      return { data: null, error: insertError };
    }
    
    return { 
      data: { 
        success: true, 
        id: insertData.id,
        message: 'dApp created using direct insert fallback'
      }, 
      error: null 
    };
  } catch (error) {
    console.error('All dApp insert methods failed:', error);
    return { data: null, error };
  }
}