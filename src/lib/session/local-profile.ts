/** 브라우저 localStorage — 복잡한 로그인 없이 세션 유지 */

export const LOCAL_PROFILE_KEY = "breakup_local_profile";
export const LOCAL_SESSION_KEY = "breakup_explore_logged_in";

export type LocalProfile = {
  nickname: string;
  instagramId: string;
  mbti: string;
  gender: string | null;
  ageRange: string | null;
  isHidden: boolean;
  discoverEnabled: boolean;
  updatedAt: string;
};

export const DEFAULT_LOCAL_PROFILE: LocalProfile = {
  nickname: "",
  instagramId: "",
  mbti: "",
  gender: null,
  ageRange: null,
  isHidden: false,
  discoverEnabled: true,
  updatedAt: "",
};

export function readLocalProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalProfile>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...DEFAULT_LOCAL_PROFILE,
      ...parsed,
      nickname: String(parsed.nickname ?? "").trim(),
      instagramId: String(parsed.instagramId ?? "")
        .trim()
        .replace(/^@/, ""),
      mbti: String(parsed.mbti ?? "")
        .trim()
        .toUpperCase(),
    };
  } catch {
    return null;
  }
}

export function writeLocalProfile(patch: Partial<LocalProfile>): LocalProfile {
  const prev = readLocalProfile() ?? { ...DEFAULT_LOCAL_PROFILE };
  const next: LocalProfile = {
    ...prev,
    ...patch,
    nickname: (patch.nickname ?? prev.nickname).trim(),
    instagramId: (patch.instagramId ?? prev.instagramId).replace(/^@/, "").trim(),
    mbti: (patch.mbti ?? prev.mbti).trim().toUpperCase(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function hasBasicProfile(p: LocalProfile | null): boolean {
  return Boolean(p?.nickname && p?.instagramId);
}

export function hasMbti(p: LocalProfile | null): boolean {
  return Boolean(p?.mbti && /^[EI][NS][TF][PJ]$/.test(p.mbti));
}

export function setLoggedIn(loggedIn: boolean): void {
  if (typeof window === "undefined") return;
  if (loggedIn) localStorage.setItem(LOCAL_SESSION_KEY, "1");
  else localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(LOCAL_SESSION_KEY) === "1" && hasBasicProfile(readLocalProfile())
  );
}

export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem(LOCAL_PROFILE_KEY);
}

/** MBTI 테스트 결과 페이지에서 호출 */
export function saveMbtiToLocal(mbti: string): void {
  writeLocalProfile({ mbti: mbti.trim().toUpperCase() });
}
