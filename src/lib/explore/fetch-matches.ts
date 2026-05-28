import { approximateDistanceKm, formatApproxDistance } from "@/lib/geo/approximate-distance";
import { parseGridKey } from "@/lib/geo/coarse-location";
import {
  isDisasterMatch,
  isPerfectMatch,
} from "@/lib/mbtiCompatibility";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ExploreNearbyRequest, ExploreProfileRow } from "@/lib/validation/explore";
import type { PublicProfileDto } from "@/lib/validation/profile";

export type FetchMatchesResult = {
  items: PublicProfileDto[];
  radiusKm: number;
  matchType: ExploreNearbyRequest["matchType"];
};

function getCoords(
  row: ExploreProfileRow,
  fallbackLat: number,
  fallbackLng: number
): { lat: number; lng: number } | null {
  if (
    typeof row.latitude === "number" &&
    typeof row.longitude === "number" &&
    Number.isFinite(row.latitude) &&
    Number.isFinite(row.longitude)
  ) {
    return { lat: row.latitude, lng: row.longitude };
  }
  const grid = parseGridKey(row.location_grid);
  if (grid) return { lat: grid.lat, lng: grid.lng };
  return { lat: fallbackLat, lng: fallbackLng };
}

export async function fetchMatches(
  input: ExploreNearbyRequest,
  options?: { excludeUserId?: string | null }
): Promise<FetchMatchesResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { items: [], radiusKm: input.radiusKm, matchType: input.matchType };

  let query = supabase
    .from("explore_profiles")
    .select(
      "id, user_id, display_name, mbti_type, location_grid, instagram_handle, latitude, longitude, is_hidden, discover_enabled"
    )
    .eq("discover_enabled", true)
    .eq("is_hidden", false)
    .limit(300);

  if (options?.excludeUserId) {
    query = query.neq("user_id", options.excludeUserId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const viewerMbti = input.mbtiType.toUpperCase();
  const items: PublicProfileDto[] = [];

  for (const row of (data ?? []) as ExploreProfileRow[]) {
    const coords = getCoords(row, input.lat, input.lng);
    if (!coords) continue;

    const distanceKm = approximateDistanceKm(
      { lat: input.lat, lng: input.lng, gridKey: "" },
      { lat: coords.lat, lng: coords.lng, gridKey: "" }
    );

    if (distanceKm > input.radiusKm) continue;

    const target = row.mbti_type.toUpperCase();
    const perfect = isPerfectMatch(viewerMbti, target);
    const disaster = isDisasterMatch(viewerMbti, target);

    let include = false;
    let matchType: PublicProfileDto["matchType"] = "nearby";

    switch (input.matchType) {
      case "perfect":
        include = perfect;
        matchType = "perfect";
        break;
      case "disaster":
        include = disaster;
        matchType = "disaster";
        break;
      case "all":
        include = perfect || disaster || true;
        matchType = perfect ? "perfect" : disaster ? "disaster" : "nearby";
        break;
      default:
        include = true;
        matchType = perfect ? "perfect" : disaster ? "disaster" : "nearby";
    }

    if (!include) continue;

    items.push({
      id: row.id,
      displayName: row.display_name,
      mbtiType: target,
      instagramHandle: row.instagram_handle,
      distanceKm: Math.round(distanceKm * 10) / 10,
      matchType,
    });
  }

  items.sort((a, b) => {
    const order = { perfect: 0, disaster: 1, nearby: 2 };
    const d = order[a.matchType] - order[b.matchType];
    if (d !== 0 && input.matchType === "all") return d;
    return a.distanceKm - b.distanceKm;
  });

  return {
    items: items.slice(0, input.limit),
    radiusKm: input.radiusKm,
    matchType: input.matchType,
  };
}

export { formatApproxDistance };
