import type { SupabaseClient } from "@supabase/supabase-js";

import { toCoarseLocation } from "@/lib/geo/coarse-location";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import {
  isMissingColumnError,
  PROFILE_SELECT_EXTENDED,
  PROFILE_SELECT_MINIMAL,
} from "@/lib/supabase/explore-profiles-db";
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
    updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function saveProfileForUser(
  userId: string,
  input: SaveProfileInput,
  supabase: SupabaseClient
): Promise<ProfileDto> {

  const grid = toCoarseLocation(input.lat, input.lng);
  const updatedAt = new Date().toISOString();

  const extendedRow = {
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
    updated_at: updatedAt,
  };

  const minimalRow = {
    user_id: userId,
    display_name: input.displayName,
    mbti_type: input.mbtiType,
    location_grid: grid.gridKey,
    instagram_handle: input.instagramHandle || null,
    updated_at: updatedAt,
  };

  let result = await supabase
    .from("explore_profiles")
    .upsert(extendedRow, { onConflict: "user_id" })
    .select(PROFILE_SELECT_EXTENDED)
    .single();

  if (result.error && isMissingColumnError(result.error)) {
    result = await supabase
      .from("explore_profiles")
      .upsert(minimalRow, { onConflict: "user_id" })
      .select(PROFILE_SELECT_MINIMAL)
      .single();
  }

  if (result.error) throw new Error(result.error.message);
  return mapRow(result.data as Record<string, unknown>);
}

export async function updatePrivacyForUser(
  userId: string,
  input: UpdatePrivacyInput,
  supabase: SupabaseClient
): Promise<ProfileDto> {

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.isHidden !== undefined) patch.is_hidden = input.isHidden;
  if (input.discoverEnabled !== undefined) patch.discover_enabled = input.discoverEnabled;

  let result = await supabase
    .from("explore_profiles")
    .update(patch)
    .eq("user_id", userId)
    .select(PROFILE_SELECT_EXTENDED)
    .single();

  if (result.error && isMissingColumnError(result.error)) {
    const existing = await getProfileByUserId(userId);
    if (!existing) throw new Error("프로필을 찾을 수 없습니다.");
    return existing;
  }

  if (result.error) throw new Error(result.error.message);
  return mapRow(result.data as Record<string, unknown>);
}

export async function getProfileByUserId(userId: string): Promise<ProfileDto | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  let result = await supabase
    .from("explore_profiles")
    .select(PROFILE_SELECT_EXTENDED)
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error && isMissingColumnError(result.error)) {
    result = await supabase
      .from("explore_profiles")
      .select(PROFILE_SELECT_MINIMAL)
      .eq("user_id", userId)
      .maybeSingle();
  }

  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  return mapRow(result.data as Record<string, unknown>);
}
