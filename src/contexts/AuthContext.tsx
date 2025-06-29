import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const isAdmin = profile?.user_type === 'admin';

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle refresh token errors by clearing session
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.log('AuthProvider: Invalid refresh token detected, clearing session...');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
          } else {
          if (!isProduction()) {
            console.error('AuthProvider: Error getting session:', error);
          } else {
            console.error('AuthProvider: Error getting session:', error.message);
          }
          }
        } else {
          console.log('AuthProvider: Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('AuthProvider: User found, fetching profile...');
            await fetchProfile(session.user.id);
          } else {
            console.log('AuthProvider: No user found');
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        // Clear any corrupted session data
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('AuthProvider: Initialization complete');
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'No user');
      
      // Skip processing if we haven't initialized yet
      if (!initialized) {
        console.log('AuthProvider: Skipping auth state change - not initialized yet');
        return;
      }
      
      try {
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('AuthProvider: Token refresh failed, clearing session...');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: Fetching profile for user:', session.user.email);
          await fetchProfile(session.user.id);
        } else {
          console.log('AuthProvider: No user, clearing profile');
          setProfile(null);
        }
        
        console.log('Auth state changed. User:', session?.user, 'Profile:', profile, 'Is Admin:', isAdmin);
      } catch (error) {
        console.error('AuthProvider: Error during auth state change:', error);
        // Clear session data on error
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      console.log('AuthProvider: Auth state change complete');
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [initialized]);


  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (!isProduction()) {
          console.error('AuthProvider: Error fetching profile:', error);
          console.log('AuthProvider: Profile fetch error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else {
          console.error('AuthProvider: Error fetching profile:', error.message);
        }
        if (error.code === 'PGRST116') {
          console.log('AuthProvider: Profile not found, will be created by trigger');
        }
        setProfile(null);
      } else {
        console.log('AuthProvider: Profile fetched successfully:', data.email, data.user_type);
        setProfile(data);
      }
    } catch (error) {
      if (!isProduction()) {
        console.error('AuthProvider: Unexpected error fetching profile:', error);
      } else {
        console.error('AuthProvider: Unexpected error fetching profile. Please try again.');
      }
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Starting sign in for:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Supabase signInWithPassword result error:', error);
      
      if (error) {
        if (!isProduction()) {
          console.error('AuthProvider: Sign in error:', error);
        } else {
          console.error('AuthProvider: Sign in error:', error.message);
        }
      } else {
        console.log('AuthProvider: Sign in successful');
      }
      
      return { error };
    } catch (error) {
      if (!isProduction()) {
        console.error('AuthProvider: Unexpected sign in error:', error);
      } else {
        console.error('AuthProvider: Unexpected sign in error. Please try again.');
      }
      return { error };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Starting sign out...');
    
    try {
      // Set loading state immediately
      setLoading(true);
      
      // Clear local state first to provide immediate feedback
      console.log('AuthProvider: Clearing local state...');
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Sign out from Supabase
      console.log('AuthProvider: Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (!isProduction()) {
          console.error('AuthProvider: Supabase signOut error:', error);
        } else {
          console.error('AuthProvider: Supabase signOut error:', error.message);
        }
        // Don't throw here, still redirect
      } else {
        console.log('AuthProvider: Supabase signOut successful');
      }
      
      // Force redirect regardless of any errors
      console.log('AuthProvider: Redirecting to home...');
      window.location.href = '/';
      
    } catch (error) {
      if (!isProduction()) {
        console.error('AuthProvider: Unexpected signOut error:', error);
      } else {
        console.error('AuthProvider: Unexpected signOut error. Please try again.');
      }
      
      // Even if there's an error, clear state and redirect
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};