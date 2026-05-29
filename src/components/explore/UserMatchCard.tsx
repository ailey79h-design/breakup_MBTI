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
    <button
      type="button"
      onClick={openInstagram}
      disabled={!handle}
      className="menu-card w-full text-left glass-card rounded-[1.5rem] p-5 shadow-md shadow-rose-100/40 dark:shadow-none overflow-hidden relative disabled:opacity-60"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 to-white/40 dark:from-rose-950/20 dark:to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-[10px] font-bold text-rose-400">
            {user.distanceLabel ?? formatApproxDistance(user.distanceKm)}
          </span>
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.displayName}</p>
        <p className="text-2xl font-black text-rose-500 italic mt-0.5 tracking-tight">
          {user.mbtiType}
        </p>
        {handle ? (
          <p className="text-sm font-bold text-rose-400 mt-3 flex items-center gap-1">
            @{handle}
            <span className="text-rose-300 text-xs">→</span>
          </p>
        ) : (
          <p className="text-xs text-slate-400 mt-3">인스타 미연결</p>
        )}
      </div>
    </button>
  );
}
