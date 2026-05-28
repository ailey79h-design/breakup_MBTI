/** 추천 엔진 입력/출력 — 알고리즘 교체 시 이 타입 유지 */

export type RecommendationCandidate = {
  id: string;
  displayName: string;
  mbtiType: string;
  locationGrid: string;
  instagramHandle: string | null;
  distanceKm: number;
};

export type RecommendationContext = {
  viewerMbti: string;
  viewerGridKey: string;
  maxRadiusKm: number;
};

export type ScoredCandidate = RecommendationCandidate & {
  score: number;
  reasons: string[];
};
