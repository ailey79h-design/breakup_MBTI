import {
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
} from "@/lib/supabase/project-defaults";

/** Supabase env (server + public anon key for client reads). */

export function getSupabaseUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    DEFAULT_SUPABASE_URL;
  return url.length > 0 ? url : null;
}

export function getSupabaseAnonKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    DEFAULT_SUPABASE_ANON_KEY;
  return key.length > 0 ? key : null;
}

export function getSupabaseServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  return key.length > 0 ? key : null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
