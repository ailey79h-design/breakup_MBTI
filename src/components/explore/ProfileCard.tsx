import { formatApproxDistance } from "@/lib/geo/approximate-distance";
import type { ScoredCandidate } from "@/lib/recommendations/types";
import { openInstagramInNewTab } from "@/lib/social/instagram";

type ProfileCardProps = {
  profile: ScoredCandidate;
  rank?: number;
};

export function ProfileCard({ profile, rank }: ProfileCardProps) {
  const handle = profile.instagramHandle?.replace(/^@/, "") ?? "";

  return (
    <article className="glass-card rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden">
      {rank !== undefined && rank <= 3 && (
        <span className="absolute top-3 right-3 text-[10px] font-black text-rose-300">
          #{rank}
        </span>
      )}

      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">
            {formatApproxDistance(profile.distanceKm)}
          </p>
          <h3 className="text-lg font-bold text-slate-800 truncate">{profile.displayName}</h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xl font-black text-rose-500 italic leading-none">
            {profile.mbtiType}
          </span>
          <span className="mt-1 text-[10px] font-bold text-white bg-rose-400 px-2 py-0.5 rounded-full">
            {profile.score}% match
          </span>
        </div>
      </div>

      {profile.reasons.length > 0 && (
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          {profile.reasons.join(" · ")}
        </p>
      )}

      {handle ? (
        <button
          type="button"
          onClick={() => openInstagramInNewTab(handle)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-500"
        >
          @{handle} 인스타 보기
          <span aria-hidden>↗</span>
        </button>
      ) : (
        <p className="text-[10px] text-slate-300">인스타 미연결</p>
      )}
    </article>
  );
}
