import { supabase } from '@/integrations/supabase/client';

export const authApi = {
  signUp: async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  signOut: async () => {
    // Try global sign out first to invalidate server session
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    // If global sign out fails (e.g., session already expired), 
    // fall back to local to ensure client cleanup
    if (error) {
      await supabase.auth.signOut({ scope: 'local' });
    }
    
    // Always return success since the user wanted to sign out
    return { error: null };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { data, error };
  },
};
