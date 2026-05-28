"use client";

import { useState } from "react";

import type { LocalProfile } from "@/lib/session/local-profile";

type QuickProfileFormProps = {
  initial?: LocalProfile | null;
  submitLabel?: string;
  showTagline?: boolean;
  onSubmit: (data: {
    nickname: string;
    instagramId: string;
    gender: string | null;
    ageRange: string | null;
  }) => void;
};

export function QuickProfileForm({
  initial,
  submitLabel = "저장하기",
  showTagline = false,
  onSubmit,
}: QuickProfileFormProps) {
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [instagramId, setInstagramId] = useState(initial?.instagramId ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [ageRange, setAgeRange] = useState(initial?.ageRange ?? "");
  const [note, setNote] = useState("");

  const handleStart = () => {
    if (!nickname.trim() || !instagramId.trim()) {
      setNote("닉네임과 인스타 아이디만 입력하면 바로 시작할 수 있어요.");
      return;
    }
    setNote("");
    onSubmit({
      nickname: nickname.trim(),
      instagramId: instagramId.trim().replace(/^@/, ""),
      gender: gender || null,
      ageRange: ageRange || null,
    });
  };

  const inputClass =
    "mt-1 w-full rounded-2xl border-2 border-rose-100 bg-white/80 px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100";

  return (
    <div className="glass-card rounded-[2rem] p-6 space-y-4 shadow-lg shadow-rose-100/50 fade-in-delay-2 dark:shadow-none">
      {showTagline && (
        <div className="text-center">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            프로필
          </p>
        </div>
      )}

      <label className="block">
        <span className="text-[10px] font-bold text-rose-400">닉네임</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={40}
          placeholder="말랑이"
          className={inputClass}
          autoComplete="nickname"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-bold text-rose-400">인스타그램</span>
        <div className="mt-1 flex rounded-2xl border-2 border-rose-100 bg-white/80 overflow-hidden focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 dark:border-slate-600 dark:bg-slate-800/80">
          <span className="px-3 py-3 text-sm text-rose-300 font-bold">@</span>
          <input
            value={instagramId}
            onChange={(e) => setInstagramId(e.target.value.replace(/^@/, ""))}
            maxLength={30}
            placeholder="mina_daily"
            className="flex-1 py-3 pr-3 text-sm outline-none bg-transparent text-slate-700 dark:text-slate-100"
            autoComplete="off"
          />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] font-bold text-rose-400">성별 (선택)</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`${inputClass} py-2 text-xs`}
          >
            <option value="">선택 안 함</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
            <option value="other">기타</option>
            <option value="prefer_not">밝히지 않음</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold text-rose-400">연령대 (선택)</span>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className={`${inputClass} py-2 text-xs`}
          >
            <option value="">선택 안 함</option>
            <option value="10s">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50plus">50+</option>
          </select>
        </label>
      </div>

      {note && (
        <p className="text-[10px] text-center text-rose-500 font-medium">{note}</p>
      )}

      <button
        type="button"
        onClick={handleStart}
        className="w-full py-5 btn-pink text-white rounded-3xl font-bold text-lg shadow-xl shadow-rose-200 active:scale-95 transition-transform"
      >
        {submitLabel}
      </button>
    </div>
  );
}
