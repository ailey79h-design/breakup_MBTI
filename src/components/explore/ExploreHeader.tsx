"use client";

type ExploreHeaderProps = {
  onSignOut?: () => void;
};

export function ExploreHeader({ onSignOut }: ExploreHeaderProps) {
  return (
    <header className="py-6 flex items-center justify-between gap-3 sticky top-0 z-20 bg-[var(--explore-bg)]/85 backdrop-blur-md">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 text-rose-500 text-xl font-black tracking-tighter"
      >
        B-TYPE 💖
      </button>
      <div className="flex items-center gap-2 shrink-0">
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="text-[10px] font-bold text-slate-400"
          >
            로그아웃
          </button>
        )}
        <a
          href="https://www.instagram.com/ailey79h"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-rose-400 hover:text-rose-500 whitespace-nowrap"
        >
          @ailey79h
        </a>
      </div>
    </header>
  );
}
