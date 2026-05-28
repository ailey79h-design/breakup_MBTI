/** Supabase env (server + public anon key for client reads). */

export function getSupabaseUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  return url.length > 0 ? url : null;
}

export function getSupabaseAnonKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    "";
  return key.length > 0 ? key : null;
}

export function getSupabaseServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  return key.length > 0 ? key : null;
}

export function isSupabaseConfigured(): boolean {
  if (typeof window !== "undefined") {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    );
  }
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
