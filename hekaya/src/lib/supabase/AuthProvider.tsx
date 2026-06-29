"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  isAdmin: boolean;
};

export type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * App-wide auth state, backed by Supabase. A single instance lives at the root
 * (see Providers), so there is exactly one `getUser()` call and one
 * `onAuthStateChange` subscription for the whole app — every `useAuth()` reads
 * from this shared context instead of opening its own.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, is_admin")
      .eq("id", u.id)
      .maybeSingle();
    setUser(u);
    setProfile(
      data
        ? {
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            isAdmin: data.is_admin,
          }
        : null,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) void loadProfile(data.user);
    });

    // onAuthStateChange fires while Supabase holds its auth lock. loadProfile
    // queries the `profiles` table, which needs that same lock — calling it
    // directly here deadlocks until the lock times out (the cause of slow
    // sign-in/sign-out). Defer with setTimeout(0) so it runs after release.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active)
        setTimeout(() => {
          if (active) void loadProfile(session?.user ?? null);
        }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return error?.message ?? null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Read the shared auth state. Must be used under <AuthProvider>. */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
