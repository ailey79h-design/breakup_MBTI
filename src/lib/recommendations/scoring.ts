import { MBTI_BEST_MATCH, MBTI_WORST_MATCH } from "./mbti-compatibility";
import type {
  RecommendationCandidate,
  RecommendationContext,
  ScoredCandidate,
} from "./types";

/** v1: 이별 MBTI 궁합표 + 거리 감쇠 — 추후 ML/규칙 엔진으로 교체 가능 */

function sameAxisGroup(a: string, b: string): number {
  let match = 0;
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) match++;
  }
  return match;
}

export function scoreCandidate(
  candidate: RecommendationCandidate,
  ctx: RecommendationContext
): ScoredCandidate {
  const reasons: string[] = [];
  let score = 50;

  const viewer = ctx.viewerMbti.toUpperCase();
  const target = candidate.mbtiType.toUpperCase();

  if (viewer === target) {
    score += 15;
    reasons.push("같은 이별 유형");
  }

  const best = MBTI_BEST_MATCH[viewer];
  const worst = MBTI_WORST_MATCH[viewer];

  if (best && target === best) {
    score += 30;
    reasons.push("환상의 짝꿍 💕");
  } else if (worst && target === worst) {
    score -= 25;
    reasons.push("최악의 궁합 ⚡");
  }

  const axisMatch = sameAxisGroup(viewer, target);
  if (axisMatch >= 3) {
    score += 10;
    reasons.push("성향이 비슷함");
  }

  const distancePenalty = Math.min(30, candidate.distanceKm * 2);
  score -= distancePenalty;
  if (candidate.distanceKm <= ctx.maxRadiusKm * 0.3) {
    reasons.push("가까운 격자");
  }

  return {
    ...candidate,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
  };
}

export function rankCandidates(
  candidates: RecommendationCandidate[],
  ctx: RecommendationContext
): ScoredCandidate[] {
  return candidates
    .map((c) => scoreCandidate(c, ctx))
    .sort((a, b) => b.score - a.score);
}
