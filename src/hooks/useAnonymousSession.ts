"use client";

import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** UI 없이 Supabase 익명 세션만 확보 (DB 동기화용) */
export function useAnonymousSession() {
  const [ready, setReady] = useState(false);
  const configured = isSupabaseConfigured();

  const ensureSession = useCallback(async (): Promise<boolean> => {
    if (!configured) return false;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) return true;
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }, [configured]);

  useEffect(() => {
    void ensureSession().then(() => setReady(true));
  }, [ensureSession]);

  return { configured, ready, ensureSession };
}
