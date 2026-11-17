import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchProfile(currentUser?.id).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Ignore silent TOKEN_REFRESHED events on tab focus so unsaved forms are never wiped
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile(currentUser?.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    if (!email.toLowerCase().endsWith('@iiitnr.edu.in')) {
      return { error: { message: 'Please use your official @iiitnr.edu.in email address.' } };
    }
    return await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() }
      }
    });
  };

  const signIn = async ({ email, password }) => {
    return await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
  };

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/profile`
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        resetPassword,
        signOut,
        refreshProfile: () => fetchProfile(user?.id)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
