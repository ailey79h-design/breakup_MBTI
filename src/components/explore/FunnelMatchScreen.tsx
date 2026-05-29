"use client";

import { useEffect, useState } from "react";

import { UserMatchCard } from "@/components/explore/UserMatchCard";
import { AsyncState } from "@/components/ui/AsyncState";
import type { RadiusKm } from "@/hooks/useExploreNearby";
import { useExploreNearby } from "@/hooks/useExploreNearby";
import { GeoPositionError, getCurrentPosition } from "@/lib/geo/get-position";
import type { PublicProfileDto } from "@/lib/validation/profile";

type FunnelMatchScreenProps = {
  mbtiType: string;
  profileVersion?: string;
  onSyncLocation: (lat: number, lng: number) => Promise<boolean>;
};

function MatchSection({
  title,
  subtitle,
  items,
  emptyEmoji,
}: {
  title: string;
  subtitle: string;
  items: PublicProfileDto[];
  emptyEmoji: string;
}) {
  if (items.length === 0) {
    return (
      <div className="glass-card rounded-[2rem] p-6 text-center mx-1 mb-4">
        <p className="text-2xl mb-2">{emptyEmoji}</p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{subtitle}</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="text-center mb-4">
        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
      <ul className="space-y-3 px-1">
        {items.map((u) => (
          <li key={u.id}>
            <UserMatchCard user={u} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FunnelMatchScreen({
  mbtiType,
  profileVersion,
  onSyncLocation,
}: FunnelMatchScreenProps) {
  const perfect = useExploreNearby();
  const disaster = useExploreNearby();
  const [geoError, setGeoError] = useState("");
  const [locationConsent, setLocationConsent] = useState(false);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(3);

  const status =
    perfect.status === "loading" || disaster.status === "loading"
      ? "loading"
      : perfect.status === "error" || disaster.status === "error"
        ? "error"
        : perfect.items.length === 0 && disaster.items.length === 0
          ? "empty"
          : "success";

  const refresh = async (radius: RadiusKm) => {
    if (!locationConsent) {
      setGeoError("위치 이용에 동의해 주세요.");
      return;
    }
    setGeoError("");
    try {
      const pos = await getCurrentPosition();
      const synced = await onSyncLocation(pos.coords.latitude, pos.coords.longitude);
      if (!synced) {
        setGeoError("프로필 동기화에 실패했습니다. 처음 화면에서 정보를 다시 입력해 주세요.");
        return;
      }
      const base = {
        mbtiType,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        radiusKm: radius,
      };
      await Promise.all([
        perfect.search({ ...base, matchType: "perfect" }),
        disaster.search({ ...base, matchType: "disaster" }),
      ]);
    } catch (e) {
      setGeoError(
        e instanceof GeoPositionError ? e.message : "위치를 가져오지 못했습니다."
      );
    }
  };

  useEffect(() => {
    if (locationConsent) {
      void refresh(radiusKm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mbtiType, profileVersion, locationConsent, radiusKm]);

  return (
    <div className="flex flex-col fade-in pb-8">
      <div className="text-center mb-6">
        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">
          FIND YOUR MATCH
        </p>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
          근처에서 나의 짝궁 찾기
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          내 유형{" "}
          <span className="text-rose-500 font-black italic">{mbtiType}</span> 기준
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-4 mb-4 mx-1">
        <label className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <input
            type="checkbox"
            checked={locationConsent}
            onChange={(e) => setLocationConsent(e.target.checked)}
            className="mt-1 shrink-0"
          />
          <span>
            주변 사용자 추천을 위해 현재 위치를 사용합니다. GPS 좌표는 공개되지 않고
            거리만 표시됩니다.
          </span>
        </label>
      </div>

      {locationConsent && (
        <div className="flex gap-2 justify-center mb-6">
          {([1, 3, 5] as const).map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setRadiusKm(km)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                radiusKm === km
                  ? "btn-pink text-white shadow-lg shadow-rose-200"
                  : "soft-pink-bg text-rose-400 border border-rose-100"
              }`}
            >
              {km}km
            </button>
          ))}
        </div>
      )}

      {geoError && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center px-4 mb-3">
          {geoError}
        </p>
      )}

      {!locationConsent ? (
        <p className="text-sm text-slate-400 text-center py-10 px-4 leading-relaxed">
          위치 동의를 체크하면
          <br />
          환상의 조합 · 파멸의 조합을 찾아드려요 📍
        </p>
      ) : (
        <AsyncState
          status={status}
          loading={
            <div className="space-y-3 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-[1.5rem] soft-pink-bg animate-pulse"
                />
              ))}
            </div>
          }
          error={
            <p className="text-sm text-rose-600 text-center px-4">
              {perfect.errorMessage || disaster.errorMessage}
            </p>
          }
          empty={
            <div className="glass-card rounded-[2rem] p-8 text-center mx-1">
              <p className="text-3xl mb-2">🥲</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                이 반경 안에 추천할 사용자가 없어요.
                <br />
                거리를 넓혀 보세요.
              </p>
            </div>
          }
        >
          <MatchSection
            title="환상의 조합"
            subtitle="궁합이 찰떡인 주변 사용자"
            items={perfect.items}
            emptyEmoji="💕"
          />
          <MatchSection
            title="파멸의 조합"
            subtitle="궁합이 최악인 주변 사용자"
            items={disaster.items}
            emptyEmoji="⚡"
          />
        </AsyncState>
      )}
    </div>
  );
}
