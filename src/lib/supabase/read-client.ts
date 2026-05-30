import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Server reads — prefer service role, fall back to anon (RLS allows public select). */
export function createSupabaseReadClient(): SupabaseClient | null {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
