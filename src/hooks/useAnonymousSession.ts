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

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) return true;

        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn("[ensureSession] signInAnonymously:", error.message);
        }

        await new Promise((r) => setTimeout(r, 200));
        const { data: after } = await supabase.auth.getSession();
        if (after.session) return true;
      }

      return false;
    } catch (e) {
      console.warn("[ensureSession]", e);
      return false;
    }
  }, [configured]);

  useEffect(() => {
    void ensureSession().then(() => setReady(true));
  }, [ensureSession]);

  return { configured, ready, ensureSession };
}
