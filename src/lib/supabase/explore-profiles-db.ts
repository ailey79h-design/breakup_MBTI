import type { PostgrestError } from "@supabase/supabase-js";

/** PostgREST schema cache — 컬럼 없음 오류 */
export function isMissingColumnError(error: PostgrestError | null | undefined): boolean {
  if (!error?.message) return false;
  return (
    /Could not find the '.+' column/.test(error.message) ||
    /column .+ does not exist/i.test(error.message)
  );
}

export const PROFILE_SELECT_EXTENDED =
  "id, display_name, mbti_type, location_grid, instagram_handle, gender, age_range, is_hidden, discover_enabled, updated_at";

export const PROFILE_SELECT_MINIMAL =
  "id, display_name, mbti_type, location_grid, instagram_handle, updated_at";

export const MATCH_SELECT_EXTENDED =
  "id, user_id, display_name, mbti_type, location_grid, instagram_handle, latitude, longitude, is_hidden, discover_enabled";

export const MATCH_SELECT_MINIMAL =
  "id, user_id, display_name, mbti_type, location_grid, instagram_handle";
