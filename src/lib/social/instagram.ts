const INSTAGRAM_BASE = "https://www.instagram.com/";

export function instagramProfileUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  return `${INSTAGRAM_BASE}${encodeURIComponent(clean)}/`;
}

/** 외부 링크 새 탭 (인스타 연결) */
export function openInstagramInNewTab(handle: string): void {
  const url = instagramProfileUrl(handle);
  window.open(url, "_blank", "noopener,noreferrer");
}

export const DEFAULT_INSTAGRAM_HANDLE = "ailey79h";
