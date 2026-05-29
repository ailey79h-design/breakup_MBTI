import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isMissingColumnError,
  MATCH_SELECT_EXTENDED,
  MATCH_SELECT_MINIMAL,
} from "@/lib/supabase/explore-profiles-db";
import type { ExploreProfileRow } from "@/lib/validation/explore";

export async function loadExploreProfileRows(options?: {
  excludeUserId?: string | null;
  limit?: number;
}): Promise<ExploreProfileRow[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const limit = options?.limit ?? 300;

  let query = supabase
    .from("explore_profiles")
    .select(MATCH_SELECT_EXTENDED)
    .eq("discover_enabled", true)
    .eq("is_hidden", false)
    .limit(limit);

  if (options?.excludeUserId) {
    query = query.neq("user_id", options.excludeUserId);
  }

  const first = await query;
  let rows: ExploreProfileRow[] = (first.data ?? []) as ExploreProfileRow[];
  let fetchError = first.error;

  if (fetchError && isMissingColumnError(fetchError)) {
    let fallback = supabase.from("explore_profiles").select(MATCH_SELECT_MINIMAL).limit(limit);
    if (options?.excludeUserId) {
      fallback = fallback.neq("user_id", options.excludeUserId);
    }
    const second = await fallback;
    rows = (second.data ?? []) as ExploreProfileRow[];
    fetchError = second.error;
  }

  if (fetchError) throw new Error(fetchError.message);
  return rows;
}
