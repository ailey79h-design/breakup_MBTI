import { createSupabaseAdminClient } from "./admin";

/** @deprecated Prefer createSupabaseAuthClient (session) or createSupabaseAdminClient */
export function createSupabaseServerClient() {
  return createSupabaseAdminClient();
}

export { createSupabaseAdminClient };
export { isSupabaseConfigured } from "./env";
