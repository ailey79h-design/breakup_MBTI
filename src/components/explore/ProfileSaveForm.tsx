"use client";

import { useEffect, useState } from "react";

import {
  AgeRangePicker,
  type AgeRangeValue,
} from "@/components/explore/AgeRangePicker";
import { GenderPicker, type GenderValue } from "@/components/explore/GenderPicker";
import { AsyncState } from "@/components/ui/AsyncState";
import { GeoPositionError, getCurrentPosition } from "@/lib/geo/get-position";
import type { ProfileDto } from "@/lib/validation/profile";
import type { ProfileStatus } from "@/hooks/useProfile";

const MBTI_OPTIONS = [
  "ENTP", "ENTJ", "ENFP", "ENFJ",
  "ESTP", "ESTJ", "ESFP", "ESFJ",
  "INTP", "INTJ", "INFP", "INFJ",
  "ISTP", "ISTJ", "ISFP", "ISFJ",
] as const;

type ProfileSaveFormProps = {
  status: ProfileStatus;
  initial?: ProfileDto | null;
  error: string;
  defaultMbti?: string;
  onSave: (data: {
    displayName: string;
    mbtiType: string;
    lat: number;
    lng: number;
    instagramHandle: string | null;
    gender: string | null;
    ageRange: string | null;
    locationConsent: true;
  }) => Promise<boolean>;
};

export function ProfileSaveForm({
  status,
  initial,
  error,
  defaultMbti,
  onSave,
}: ProfileSaveFormProps) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [mbtiType, setMbtiType] = useState(initial?.mbtiType ?? defaultMbti ?? "ENTP");
  const [instagram, setInstagram] = useState(initial?.instagramHandle?.replace(/^@/, "") ?? "");
  const [gender, setGender] = useState<GenderValue>((initial?.gender as GenderValue) ?? "");
  const [ageRange, setAgeRange] = useState<AgeRangeValue>(
    (initial?.ageRange as AgeRangeValue) ?? ""
  );
  const [locationConsent, setLocationConsent] = useState(false);
  const [locationNote, setLocationNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setDisplayName(initial.displayName);
      setMbtiType(initial.mbtiType);
      setInstagram(initial.instagramHandle?.replace(/^@/, "") ?? "");
      setGender((initial.gender as GenderValue) ?? "");
      setAgeRange((initial.ageRange as AgeRangeValue) ?? "");
    }
  }, [initial]);

  const handleSubmit = async () => {
    if (!displayName.trim() || !instagram.trim()) {
      setLocationNote("닉네임과 인스타 아이디는 필수예요.");
      return;
    }
    if (!locationConsent) {
      setLocationNote("위치 이용 동의가 필요해요.");
      return;
    }

    setSaving(true);
    setLocationNote("");
    try {
      const pos = await getCurrentPosition();
      const ok = await onSave({
        displayName: displayName.trim(),
        mbtiType,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        instagramHandle: instagram.trim(),
        gender: gender || null,
        ageRange: ageRange || null,
        locationConsent: true,
      });
      if (ok) {
        setLocationNote("저장 완료! 정확한 좌표는 다른 사용자에게 보이지 않아요.");
      }
    } catch (e) {
      setLocationNote(
        e instanceof GeoPositionError ? e.message : "위치를 가져오지 못했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-bold text-rose-400 uppercase">프로필</p>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">내 정보</h2>
      </div>

      <label className="block">
        <span className="text-[10px] font-bold text-rose-400">닉네임 *</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          className="mt-1 w-full rounded-xl border border-rose-100 dark:border-slate-600 dark:bg-slate-800 px-3 py-3 text-sm font-medium"
          placeholder="Mina"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-bold text-rose-400">인스타그램 아이디 *</span>
        <div className="mt-1 flex rounded-xl border border-rose-100 dark:border-slate-600 dark:bg-slate-800 overflow-hidden">
          <span className="px-3 py-3 text-sm text-rose-300">@</span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
            maxLength={30}
            className="flex-1 py-3 pr-3 text-sm outline-none bg-transparent"
            placeholder="mina_daily"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-[10px] font-bold text-rose-400">이별 MBTI *</span>
        <select
          value={mbtiType}
          onChange={(e) => setMbtiType(e.target.value)}
          className="mt-1 w-full rounded-xl border border-rose-100 dark:border-slate-600 dark:bg-slate-800 px-3 py-3 text-sm font-bold"
        >
          {MBTI_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-bold text-rose-400">성별 (선택)</span>
          <GenderPicker value={gender} onChange={setGender} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-rose-400">연령대 (선택)</span>
          <AgeRangePicker value={ageRange} onChange={setAgeRange} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
        <input
          type="checkbox"
          checked={locationConsent}
          onChange={(e) => setLocationConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          위치 정보를 주변 사용자 탐색에 사용하는 것에 동의합니다. GPS 좌표는 다른
          사용자에게 공개되지 않으며, 거리(예: 0.8km)만 표시됩니다.
        </span>
      </label>

      <AsyncState
        status={saving || status === "loading" ? "loading" : "idle"}
        loading={<p className="text-sm text-rose-400 text-center">저장 중…</p>}
      >
        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="w-full py-4 btn-pink text-white rounded-3xl font-bold text-base shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
        >
          프로필 · 위치 저장
        </button>
      </AsyncState>

      {locationNote && (
        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">{locationNote}</p>
      )}
      {error && <p className="text-xs text-center text-rose-500">{error}</p>}
    </div>
  );
}
