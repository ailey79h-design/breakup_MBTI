"use client";

import { useState } from "react";

import { ExploreSectionHeader } from "@/components/explore/ExploreSectionHeader";
import { QuickProfileForm } from "@/components/explore/QuickProfileForm";
import type { LocalProfile } from "@/lib/session/local-profile";

const MBTI_OPTIONS = [
  "ENTP", "ENTJ", "ENFP", "ENFJ",
  "ESTP", "ESTJ", "ESFP", "ESFJ",
  "INTP", "INTJ", "INFP", "INFJ",
  "ISTP", "ISTJ", "ISFP", "ISFJ",
] as const;

type ProfileSettingsPanelProps = {
  profile: LocalProfile | null;
  error: string;
  onSaveQuick: (data: {
    nickname: string;
    instagramId: string;
    gender: string | null;
    ageRange: string | null;
  }) => void;
  onMbtiChange: (mbti: string) => void;
  onPrivacyChange: (patch: {
    isHidden?: boolean;
    discoverEnabled?: boolean;
  }) => Promise<boolean>;
};

export function ProfileSettingsPanel({
  profile,
  error,
  onSaveQuick,
  onMbtiChange,
  onPrivacyChange,
}: ProfileSettingsPanelProps) {
  const [hidden, setHidden] = useState(profile?.isHidden ?? false);
  const [discover, setDiscover] = useState(profile?.discoverEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  return (
    <div className="space-y-4 pb-8 fade-in">
      <ExploreSectionHeader
        badge="MY PROFILE"
        title="내 프로필"
        subtitle="닉네임 · 인스타 · MBTI · 탐색 설정"
      />

      <QuickProfileForm
        initial={profile}
        showTagline={false}
        onSubmit={(data) => {
          onSaveQuick(data);
          setSavedNote("저장됐어요! 이 기기에 유지됩니다.");
          setTimeout(() => setSavedNote(""), 2500);
        }}
      />

      {savedNote && (
        <p className="text-xs text-center text-emerald-600 font-medium">{savedNote}</p>
      )}

      <div className="glass-card rounded-[2rem] p-5 space-y-3 shadow-md shadow-rose-100/30">
        <p className="text-xs font-bold text-rose-400">이별 MBTI</p>
        <select
          value={profile?.mbti || ""}
          onChange={(e) => onMbtiChange(e.target.value)}
          className="w-full rounded-2xl border-2 border-rose-100 bg-white/80 px-3 py-3 text-sm font-black text-rose-500 dark:border-slate-600 dark:bg-slate-800/80"
        >
          <option value="">테스트 후 자동 입력</option>
          {MBTI_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400">
          테스트를 완료하면 결과가 자동으로 저장돼요.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-5 space-y-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">개인정보 · 탐색</p>
        <label className="flex items-center justify-between gap-3 py-1 border-b border-rose-50 dark:border-slate-700">
          <span className="text-xs text-slate-500">근처 추천 OFF</span>
          <input
            type="checkbox"
            checked={!discover}
            onChange={async (e) => {
              const off = e.target.checked;
              setSaving(true);
              const ok = await onPrivacyChange({ discoverEnabled: !off });
              if (ok) setDiscover(!off);
              setSaving(false);
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 py-1">
          <span className="text-xs text-slate-500">프로필 숨김</span>
          <input
            type="checkbox"
            checked={hidden}
            onChange={async (e) => {
              const v = e.target.checked;
              setSaving(true);
              const ok = await onPrivacyChange({ isHidden: v });
              if (ok) setHidden(v);
              setSaving(false);
            }}
          />
        </label>
        {saving && <p className="text-[10px] text-rose-400 text-center">저장 중…</p>}
      </div>

      {error && <p className="text-xs text-center text-rose-500">{error}</p>}
    </div>
  );
}
