import { approximateDistanceKm } from "@/lib/geo/approximate-distance";
import { parseGridKey } from "@/lib/geo/coarse-location";
import { loadExploreProfileRows } from "@/lib/explore/load-explore-profiles";
import {
  isDisasterMatch,
  isPerfectMatch,
} from "@/lib/mbtiCompatibility";
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
  const rows = await loadExploreProfileRows({ excludeUserId: options?.excludeUserId });

  const viewerMbti = input.mbtiType.toUpperCase();
  const items: PublicProfileDto[] = [];

  for (const row of rows) {
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

    const rounded = Math.round(distanceKm * 10) / 10;
    items.push({
      id: row.id,
      displayName: row.display_name,
      mbtiType: target,
      instagramHandle: row.instagram_handle,
      distanceKm: rounded,
      distanceLabel:
        rounded < 0.1
          ? "0.1km 거리"
          : rounded < 10
            ? `${rounded.toFixed(1)}km 거리`
            : `${Math.round(rounded)}km 거리`,
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

export { formatApproxDistance } from "@/lib/geo/approximate-distance";
