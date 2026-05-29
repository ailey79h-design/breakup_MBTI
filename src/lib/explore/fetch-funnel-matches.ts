import { approximateDistanceKm } from "@/lib/geo/approximate-distance";
import { parseGridKey } from "@/lib/geo/coarse-location";
import { loadExploreProfileRows } from "@/lib/explore/load-explore-profiles";
import {
  isDisasterMatch,
  isPerfectMatch,
} from "@/lib/mbtiCompatibility";
import type { ExploreProfileRow } from "@/lib/validation/explore";
import type { PublicProfileDto } from "@/lib/validation/profile";

const NEARBY_RADIUS_KM = 5;
const MIN_RECOMMENDATIONS = 3;
const MAX_PER_SECTION = 20;

export type FunnelFallbackTier =
  | "nearby_perfect"
  | "global_perfect"
  | "global_disaster"
  | "all_users";

export type FunnelRecommendResult = {
  tier: FunnelFallbackTier;
  bannerMessage: string | null;
  perfectItems: PublicProfileDto[];
  disasterItems: PublicProfileDto[];
  /** 합쳐서 최소 3명 보장 */
  items: PublicProfileDto[];
};

type ScoredCandidate = {
  row: ExploreProfileRow;
  distanceKm: number;
  isPerfect: boolean;
  isDisaster: boolean;
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

function scoreCandidates(
  rows: ExploreProfileRow[],
  viewerMbti: string,
  lat: number,
  lng: number
): ScoredCandidate[] {
  const viewer = viewerMbti.toUpperCase();
  const origin = { lat, lng, gridKey: "" };
  const out: ScoredCandidate[] = [];

  for (const row of rows) {
    const coords = getCoords(row, lat, lng);
    if (!coords) continue;
    const target = row.mbti_type.toUpperCase();
    const distanceKm = approximateDistanceKm(origin, {
      lat: coords.lat,
      lng: coords.lng,
      gridKey: "",
    });
    out.push({
      row,
      distanceKm: Math.round(distanceKm * 10) / 10,
      isPerfect: isPerfectMatch(viewer, target),
      isDisaster: isDisasterMatch(viewer, target),
    });
  }

  return out;
}

function gpsDistanceLabel(km: number): string {
  if (km < 0.1) return "0.1km 거리";
  if (km < 10) return `${km.toFixed(1)}km 거리`;
  return `${Math.round(km)}km 거리`;
}

const REMOTE_LABELS = ["다른 지역", "온라인 추천", "전국 추천"] as const;

function toDto(
  c: ScoredCandidate,
  matchType: PublicProfileDto["matchType"],
  distanceMode: "gps" | "remote",
  remoteLabelIndex = 0
): PublicProfileDto {
  const distanceLabel =
    distanceMode === "gps"
      ? gpsDistanceLabel(c.distanceKm)
      : REMOTE_LABELS[remoteLabelIndex % REMOTE_LABELS.length];

  return {
    id: c.row.id,
    displayName: c.row.display_name,
    mbtiType: c.row.mbti_type.toUpperCase(),
    instagramHandle: c.row.instagram_handle,
    distanceKm: c.distanceKm,
    matchType,
    distanceLabel,
  };
}

function sortByDistance(a: ScoredCandidate, b: ScoredCandidate): number {
  return a.distanceKm - b.distanceKm;
}

function ensureMinimum(
  primary: PublicProfileDto[],
  pools: PublicProfileDto[][]
): PublicProfileDto[] {
  const seen = new Set(primary.map((p) => p.id));
  const out = [...primary];

  for (const pool of pools) {
    for (const item of pool) {
      if (out.length >= MIN_RECOMMENDATIONS) return out;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }

  return out;
}

export async function fetchFunnelRecommendations(
  input: { mbtiType: string; lat: number; lng: number },
  options?: { excludeUserId?: string | null }
): Promise<FunnelRecommendResult> {
  const rows = await loadExploreProfileRows({ excludeUserId: options?.excludeUserId });
  const scored = scoreCandidates(rows, input.mbtiType, input.lat, input.lng);

  const nearbyPerfect = scored.filter((c) => c.isPerfect && c.distanceKm <= NEARBY_RADIUS_KM);
  const nearbyDisaster = scored.filter((c) => c.isDisaster && c.distanceKm <= NEARBY_RADIUS_KM);
  const globalPerfect = scored.filter((c) => c.isPerfect);
  const globalDisaster = scored.filter((c) => c.isDisaster);
  const allSorted = [...scored].sort(sortByDistance);

  nearbyPerfect.sort(sortByDistance);
  nearbyDisaster.sort(sortByDistance);
  globalPerfect.sort(sortByDistance);
  globalDisaster.sort(sortByDistance);

  const allUserDtos = allSorted.map((c, i) =>
    toDto(
      c,
      c.isPerfect ? "perfect" : c.isDisaster ? "disaster" : "nearby",
      "remote",
      i
    )
  );

  let tier: FunnelFallbackTier;
  let bannerMessage: string | null;
  let perfectItems: PublicProfileDto[];
  let disasterItems: PublicProfileDto[];

  if (nearbyPerfect.length > 0) {
    tier = "nearby_perfect";
    bannerMessage = null;
    perfectItems = nearbyPerfect
      .slice(0, MAX_PER_SECTION)
      .map((c) => toDto(c, "perfect", "gps"));
    disasterItems = nearbyDisaster
      .slice(0, MAX_PER_SECTION)
      .map((c) => toDto(c, "disaster", "gps"));
  } else if (globalPerfect.length > 0) {
    tier = "global_perfect";
    bannerMessage = "주변에서는 찾지 못했지만 다른 지역의 짝궁을 발견했어요 💕";
    perfectItems = globalPerfect
      .slice(0, MAX_PER_SECTION)
      .map((c, i) => toDto(c, "perfect", "remote", i));
    disasterItems = [];
  } else if (globalDisaster.length > 0) {
    tier = "global_disaster";
    bannerMessage = "환상의 조합은 찾지 못했지만 흥미로운 인연을 발견했어요 👀";
    perfectItems = [];
    disasterItems = globalDisaster
      .slice(0, MAX_PER_SECTION)
      .map((c, i) => toDto(c, "disaster", "remote", i));
  } else {
    tier = "all_users";
    bannerMessage = "아직 데이터가 충분하지 않아요. 먼저 테스트한 사람들을 만나보세요 ✨";
    perfectItems = [];
    disasterItems = [];
  }

  if (tier === "all_users") {
    const items = allUserDtos.slice(
      0,
      Math.max(MIN_RECOMMENDATIONS, Math.min(allUserDtos.length, MAX_PER_SECTION))
    );
    return {
      tier,
      bannerMessage,
      perfectItems: items,
      disasterItems: [],
      items,
    };
  }

  const primary = [...perfectItems, ...disasterItems];
  const items = ensureMinimum(primary, [allUserDtos]);
  const primaryIds = new Set(primary.map((p) => p.id));
  const extras = items.filter((p) => !primaryIds.has(p.id));

  let finalPerfect = perfectItems;
  let finalDisaster = disasterItems;

  if (extras.length > 0) {
    if (finalPerfect.length > 0) {
      finalPerfect = [...finalPerfect, ...extras];
    } else if (finalDisaster.length > 0) {
      finalDisaster = [...finalDisaster, ...extras];
    } else {
      finalPerfect = extras;
    }
  }

  return {
    tier,
    bannerMessage,
    perfectItems: finalPerfect,
    disasterItems: finalDisaster,
    items,
  };
}
