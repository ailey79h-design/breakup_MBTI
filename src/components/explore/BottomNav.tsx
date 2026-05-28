"use client";

export type ExploreTab =
  | "home"
  | "test"
  | "result"
  | "nearby"
  | "perfect"
  | "disaster"
  | "profile";

const TABS: { id: ExploreTab; label: string; icon: string }[] = [
  { id: "home", label: "홈", icon: "🏠" },
  { id: "test", label: "테스트", icon: "💔" },
  { id: "result", label: "결과", icon: "✨" },
  { id: "nearby", label: "짝궁", icon: "📍" },
  { id: "perfect", label: "환상", icon: "💕" },
  { id: "disaster", label: "파멸", icon: "⚡" },
  { id: "profile", label: "프로필", icon: "👤" },
];

type BottomNavProps = {
  active: ExploreTab;
  onChange: (tab: ExploreTab) => void;
};

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-rose-100/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md safe-area-pb shadow-[0_-8px_30px_rgba(251,113,133,0.08)]">
      <div className="max-w-md mx-auto flex justify-between px-0.5 pt-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center flex-shrink-0 w-[14.28%] py-1 min-w-0 ${
              active === t.id ? "text-rose-500" : "text-slate-400"
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span className="text-[8px] font-bold mt-0.5 truncate w-full text-center">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
