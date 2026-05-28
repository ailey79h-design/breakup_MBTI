/**
 * MBTI 궁합 로직 — 수정 시 이 파일만 편집하세요.
 * 환상의 조합(perfect) / 파멸의 조합(disaster)
 */

export const perfectMatches: Record<string, readonly string[]> = {
  ENTP: ["INFJ", "INTJ"],
  ENTJ: ["INFP", "INTJ"],
  ENFP: ["INFJ", "ENTJ"],
  ENFJ: ["INFP", "INTP"],
  ESTP: ["ISFJ", "ISTJ"],
  ESTJ: ["ISFP", "INTP"],
  ESFP: ["ISFJ", "ESTJ"],
  ESFJ: ["ISFP", "ISTP"],
  INTP: ["ENFJ", "ENTJ"],
  INTJ: ["ENFP", "ENTP"],
  INFP: ["ENFJ", "ENTJ"],
  INFJ: ["ENFP", "ENTP"],
  ISTP: ["ESTJ", "ESFJ"],
  ISTJ: ["ESFP", "ESTP"],
  ISFP: ["ESFJ", "ENFJ"],
  ISFJ: ["ESFP", "ESTP"],
};

export const disasterMatches: Record<string, readonly string[]> = {
  ENTP: ["ISTJ", "ESTJ"],
  ENTJ: ["ESFP", "ISFP"],
  ENFP: ["ISTJ", "ESTJ"],
  ENFJ: ["ISTP", "ESTP"],
  ESTP: ["INFJ", "INTJ"],
  ESTJ: ["INFP", "ENFP"],
  ESFP: ["INTJ", "INTP"],
  ESFJ: ["INTP", "ISTP"],
  INTP: ["ESFJ", "ESFP"],
  INTJ: ["ESFP", "ESFJ"],
  INFP: ["ESTJ", "ESTP"],
  INFJ: ["ESTP", "ESTJ"],
  ISTP: ["ENFJ", "ENFP"],
  ISTJ: ["ENTP", "ENFP"],
  ISFP: ["ENTJ", "ESTJ"],
  ISFJ: ["ENTP", "ENFP"],
};

export function isPerfectMatch(viewerMbti: string, targetMbti: string): boolean {
  const list = perfectMatches[viewerMbti.toUpperCase()];
  return list?.includes(targetMbti.toUpperCase()) ?? false;
}

export function isDisasterMatch(viewerMbti: string, targetMbti: string): boolean {
  const list = disasterMatches[viewerMbti.toUpperCase()];
  return list?.includes(targetMbti.toUpperCase()) ?? false;
}

/** @deprecated 호환용 */
export const PERFECT_MATCHES = perfectMatches;
export const DISASTER_MATCHES = disasterMatches;
export const MBTI_BEST_MATCH: Record<string, string> = Object.fromEntries(
  Object.entries(perfectMatches).map(([k, v]) => [k, v[0]])
);
export const MBTI_WORST_MATCH: Record<string, string> = Object.fromEntries(
  Object.entries(disasterMatches).map(([k, v]) => [k, v[0]])
);
