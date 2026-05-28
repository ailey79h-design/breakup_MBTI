"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthStatus = "loading" | "signed_out" | "signed_in";

export function useSupabaseAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setStatus("signed_out");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setStatus(data.session ? "signed_in" : "signed_out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession ? "signed_in" : "signed_out");
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signInAnonymously = useCallback(async () => {
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInAnonymously();
      if (err) throw err;
    } catch (e) {
      setError(e instanceof Error ? e.message : "게스트 로그인 실패");
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/explore`;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (err) throw err;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google 로그인 실패");
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/explore`;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (err) throw err;
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "이메일 전송 실패");
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  }, []);

  return {
    configured,
    status,
    user,
    session,
    error,
    signInAnonymously,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  };
}
