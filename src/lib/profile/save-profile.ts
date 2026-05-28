import { toCoarseLocation } from "@/lib/geo/coarse-location";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ProfileDto,
  SaveProfileInput,
  UpdatePrivacyInput,
} from "@/lib/validation/profile";

function mapRow(data: Record<string, unknown>): ProfileDto {
  return {
    id: data.id as string,
    displayName: data.display_name as string,
    mbtiType: data.mbti_type as string,
    locationGrid: data.location_grid as string,
    instagramHandle: (data.instagram_handle as string | null) ?? null,
    gender: (data.gender as string | null) ?? null,
    ageRange: (data.age_range as string | null) ?? null,
    isHidden: Boolean(data.is_hidden),
    discoverEnabled: data.discover_enabled !== false,
    updatedAt: data.updated_at as string,
  };
}

const SELECT_OWN =
  "id, display_name, mbti_type, location_grid, instagram_handle, gender, age_range, is_hidden, discover_enabled, updated_at";

export async function saveProfileForUser(
  userId: string,
  input: SaveProfileInput
): Promise<ProfileDto> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured");

  const grid = toCoarseLocation(input.lat, input.lng);

  const row = {
    user_id: userId,
    display_name: input.displayName,
    mbti_type: input.mbtiType,
    location_grid: grid.gridKey,
    latitude: input.lat,
    longitude: input.lng,
    instagram_handle: input.instagramHandle || null,
    gender: input.gender ?? null,
    age_range: input.ageRange ?? null,
    is_hidden: false,
    discover_enabled: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("explore_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select(SELECT_OWN)
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updatePrivacyForUser(
  userId: string,
  input: UpdatePrivacyInput
): Promise<ProfileDto> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured");

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.isHidden !== undefined) patch.is_hidden = input.isHidden;
  if (input.discoverEnabled !== undefined) patch.discover_enabled = input.discoverEnabled;

  const { data, error } = await supabase
    .from("explore_profiles")
    .update(patch)
    .eq("user_id", userId)
    .select(SELECT_OWN)
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function getProfileByUserId(userId: string): Promise<ProfileDto | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("explore_profiles")
    .select(SELECT_OWN)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}
