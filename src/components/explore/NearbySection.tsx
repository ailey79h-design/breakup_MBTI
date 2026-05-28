"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { ProfileCard } from "@/components/explore/ProfileCard";
import { AsyncState } from "@/components/ui/AsyncState";
import type { ExploreUiStatus } from "@/hooks/useExploreNearby";
import type { ScoredCandidate } from "@/lib/recommendations/types";
import type { ProfileDto } from "@/lib/validation/profile";

type NearbySectionProps = {
  profile: ProfileDto;
  status: ExploreUiStatus;
  items: ScoredCandidate[];
  viewerGridKey: string | null;
  errorMessage: string;
  configHint: string;
  onRefresh: () => void;
};

export function NearbySection({
  profile,
  status,
  items,
  viewerGridKey,
  errorMessage,
  configHint,
  onRefresh,
}: NearbySectionProps) {
  return (
    <section className="space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide mb-1">
          Step 3
        </p>
        <h2 className="text-lg font-bold text-slate-800">근처 · MBTI 매칭</h2>
        <p className="text-xs text-slate-400 mt-1">
          {profile.displayName} · <span className="text-rose-500 font-bold">{profile.mbtiType}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={status === "loading"}
        className="w-full py-3 rounded-2xl bg-rose-50 text-rose-500 font-bold text-sm border border-rose-100 active:scale-[0.98] disabled:opacity-50"
      >
        {status === "loading" ? "매칭 중…" : "다시 찾기"}
      </button>

      {viewerGridKey && (
        <p className="text-[10px] text-center text-slate-400">내 격자 {viewerGridKey}</p>
      )}

      <AdSlot placementId="explore_list_inline" />

      <AsyncState
        status={status === "idle" ? "idle" : status}
        loading={
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-[1.5rem] bg-rose-50/80 animate-pulse border border-rose-100"
              />
            ))}
          </div>
        }
        error={
          <>
            <p className="text-sm font-bold text-rose-600 mb-1">{errorMessage}</p>
            {configHint && (
              <p className="text-xs text-slate-500 leading-relaxed">{configHint}</p>
            )}
          </>
        }
        empty={
          <>
            <p className="text-sm font-bold text-slate-600 mb-1">근처에 아직 없어요</p>
            <p className="text-xs text-slate-400">친구에게 테스트 링크를 공유해 보세요.</p>
          </>
        }
      >
        <ul className="space-y-3">
          {items.map((p, i) => (
            <li key={p.id} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProfileCard profile={p} rank={i + 1} />
            </li>
          ))}
        </ul>
      </AsyncState>

      <AdSlot placementId="explore_footer_banner" />
    </section>
  );
}
