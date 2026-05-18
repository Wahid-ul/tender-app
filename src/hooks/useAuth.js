import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

async function ensureProfile(user) {
  await supabase.from("profiles").upsert(
    {
      id:   user.id,
      name: user.user_metadata?.name || user.email,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
}

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session — always resolve loading even on error
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) ensureProfile(u);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) ensureProfile(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { user, loading, signUp, signIn, signOut };
}
