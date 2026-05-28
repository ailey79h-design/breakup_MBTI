"use client";

import Link from "next/link";

import type { LocalProfile } from "@/lib/session/local-profile";

type ResultSummaryProps = {
  profile: LocalProfile | null;
  mbtiFromQuery?: string;
  onFindMatch: () => void;
};

export function ResultSummary({ profile, mbtiFromQuery, onFindMatch }: ResultSummaryProps) {
  const mbti = mbtiFromQuery || profile?.mbti;

  if (!mbti) {
    return (
      <div className="glass-card rounded-[2rem] p-10 text-center space-y-5 fade-in">
        <span className="text-5xl">💔</span>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
          아직 테스트 결과가 없어요
          <br />
          <span className="text-slate-400 font-normal">12문항이면 충분해요</span>
        </p>
        <Link
          href="/breakup-mbti.html"
          className="inline-block w-full py-5 btn-pink text-white rounded-3xl font-bold text-lg shadow-xl shadow-rose-200"
        >
          테스트 시작하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="text-center">
        <span className="badge-pill">LOVE ARCHIVE #RESULTS</span>
      </div>
      <div className="glass-card rounded-[2rem] p-8 text-center shadow-lg shadow-rose-100/40">
        <p className="text-[10px] font-bold text-rose-400 mb-2">나의 이별 MBTI</p>
        <p className="text-6xl font-black text-rose-500 italic tracking-tight">{mbti}</p>
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          이 기기에 저장돼요 · 새로고침해도 유지
        </p>
      </div>
      <button
        type="button"
        onClick={onFindMatch}
        className="w-full py-5 btn-pink text-white rounded-3xl font-bold text-base shadow-xl shadow-rose-200 active:scale-95 transition-transform"
      >
        근처에서 나의 짝궁 찾기 🗺
      </button>
      <Link
        href="/breakup-mbti.html"
        className="block w-full py-4 text-center border-2 border-rose-100 text-rose-300 rounded-3xl font-bold text-sm"
      >
        다시 테스트하기
      </Link>
    </div>
  );
}
