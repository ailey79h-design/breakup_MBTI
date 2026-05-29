"use client";

import { formatApproxDistance } from "@/lib/geo/approximate-distance";
import { instagramProfileUrl } from "@/lib/social/instagram";
import type { PublicProfileDto } from "@/lib/validation/profile";

type UserMatchCardProps = {
  user: PublicProfileDto;
};

const BADGE: Record<
  PublicProfileDto["matchType"],
  { label: string; className: string }
> = {
  perfect: { label: "환상의 조합", className: "bg-rose-500 text-white shadow-sm shadow-rose-200" },
  disaster: { label: "파멸의 조합", className: "bg-slate-700 text-white" },
  nearby: { label: "근처", className: "bg-rose-100 text-rose-500 dark:bg-rose-900/40" },
};

export function UserMatchCard({ user }: UserMatchCardProps) {
  const badge = BADGE[user.matchType];
  const handle = user.instagramHandle?.replace(/^@/, "") ?? "";

  const openInstagram = () => {
    if (!handle) return;
    window.open(instagramProfileUrl(handle), "_blank", "noopener,noreferrer");
  };

  return (
    <article className="w-full glass-card rounded-[1.5rem] p-5 shadow-md shadow-rose-100/40 dark:shadow-none overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 to-white/40 dark:from-rose-950/20 dark:to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-[10px] font-bold text-rose-400 shrink-0">
            {user.distanceLabel ?? formatApproxDistance(user.distanceKm)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
              {user.displayName}
            </p>
            <p className="text-2xl font-black text-rose-500 italic mt-0.5 tracking-tight">
              {user.mbtiType}
            </p>
          </div>

          {handle ? (
            <button
              type="button"
              onClick={openInstagram}
              className="match-instagram-btn shrink-0 max-w-[10.5rem] truncate"
              title={`@${handle}`}
              aria-label={`@${handle} 인스타그램 프로필 보기`}
            >
              @{handle}
            </button>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 shrink-0 px-2">
              인스타 미연결
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
