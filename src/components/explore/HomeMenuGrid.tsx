"use client";

import type { ExploreTab } from "@/components/explore/BottomNav";

const MENU: {
  id: ExploreTab;
  label: string;
  sub: string;
  icon: string;
  accent: string;
}[] = [
  { id: "test", label: "MBTI 테스트", sub: "12문항 감성 테스트", icon: "💔", accent: "from-rose-100 to-pink-50" },
  { id: "result", label: "테스트 결과", sub: "내 이별 유형", icon: "✨", accent: "from-pink-100 to-rose-50" },
  { id: "nearby", label: "근처 짝궁", sub: "거리 기반 탐색", icon: "📍", accent: "from-orange-100 to-rose-50" },
  { id: "perfect", label: "환상의 조합", sub: "궁합 최고", icon: "💕", accent: "from-rose-200 to-pink-100" },
  { id: "disaster", label: "파멸의 조합", sub: "궁합 최악", icon: "⚡", accent: "from-slate-200 to-rose-50" },
  { id: "profile", label: "내 프로필", sub: "설정 · 숨김", icon: "👤", accent: "from-rose-50 to-white" },
];

type HomeMenuGridProps = {
  onSelect: (tab: ExploreTab) => void;
  nickname?: string;
  instagramId?: string;
  mbti?: string;
};

export function HomeMenuGrid({ onSelect, nickname, instagramId, mbti }: HomeMenuGridProps) {
  return (
    <div className="space-y-4 fade-in-up">
      {(nickname || instagramId) && (
        <div className="glass-card rounded-[2rem] px-5 py-4 text-center pink-gradient">
          <p className="text-[10px] font-bold text-white/90 uppercase">Welcome back</p>
          <p className="text-lg font-bold text-white mt-1">
            {nickname}
            {mbti ? (
              <span className="text-white/90 font-black italic ml-2">{mbti}</span>
            ) : null}
          </p>
          {instagramId && (
            <p className="text-xs text-white/80 mt-1 font-bold">@{instagramId}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`menu-card glass-card rounded-[1.5rem] p-4 text-left overflow-hidden relative group`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-60 dark:opacity-30`}
            />
            <div className="relative">
              <div className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-3 dark:bg-slate-800">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {item.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
