"use client";

import { useEffect, useState } from "react";

import { ExploreSectionHeader } from "@/components/explore/ExploreSectionHeader";
import { UserMatchCard } from "@/components/explore/UserMatchCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { AsyncState } from "@/components/ui/AsyncState";
import type { RadiusKm, MatchFilter } from "@/hooks/useExploreNearby";
import { useExploreNearby } from "@/hooks/useExploreNearby";
import { GeoPositionError, getCurrentPosition } from "@/lib/geo/get-position";

type MatchListPanelProps = {
  title: string;
  subtitle: string;
  badge?: string;
  matchType: MatchFilter;
  mbtiType: string;
  profileVersion?: string;
  onSyncLocation: (lat: number, lng: number) => Promise<boolean>;
};

export function MatchListPanel({
  title,
  subtitle,
  badge,
  matchType,
  mbtiType,
  profileVersion,
  onSyncLocation,
}: MatchListPanelProps) {
  const explore = useExploreNearby();
  const [geoError, setGeoError] = useState("");
  const [locationConsent, setLocationConsent] = useState(false);

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
        setGeoError("프로필 동기화에 실패했습니다. 프로필 탭에서 정보를 확인해 주세요.");
        return;
      }
      await explore.search({
        mbtiType,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        radiusKm: radius,
        matchType,
      });
    } catch (e) {
      setGeoError(
        e instanceof GeoPositionError ? e.message : "위치를 가져오지 못했습니다."
      );
    }
  };

  useEffect(() => {
    if (locationConsent) {
      void refresh(explore.radiusKm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mbtiType, matchType, profileVersion, locationConsent]);

  const badgeLabel =
    badge ??
    (matchType === "perfect"
      ? "PERFECT MATCH"
      : matchType === "disaster"
        ? "DISASTER MATCH"
        : "NEARBY");

  return (
    <section className="pb-24 fade-in">
      <ExploreSectionHeader badge={badgeLabel} title={title} subtitle={subtitle} />

      <div className="glass-card rounded-[2rem] p-4 mb-4 mx-1">
        <p className="text-center text-xs font-bold text-rose-400 mb-2">
          내 유형 · <span className="text-rose-500 italic text-sm">{mbtiType}</span>
        </p>
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
        <div className="flex gap-2 justify-center mb-4">
          {([1, 3, 5] as const).map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => {
                explore.setRadiusKm(km);
                void refresh(km);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                explore.radiusKm === km
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
          주변 짝궁을 찾아드려요 📍
        </p>
      ) : (
        <AsyncState
          status={explore.status === "idle" ? "loading" : explore.status}
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
            <p className="text-sm text-rose-600 text-center px-4">{explore.errorMessage}</p>
          }
          empty={
            <div className="glass-card rounded-[2rem] p-8 text-center mx-1">
              <p className="text-3xl mb-2">🥲</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                이 반경 안에 해당 유형이 없어요.
                <br />
                거리를 넓혀 보세요.
              </p>
            </div>
          }
        >
          <ul className="space-y-3 px-1">
            {explore.items.map((u, i) => (
              <li key={u.id}>
                <UserMatchCard user={u} />
                {i === 1 && <AdSlot placementId="explore_list_inline" />}
              </li>
            ))}
          </ul>
          {explore.items.length > 0 && (
            <div className="mt-4 px-1">
              <AdSlot placementId="explore_footer_banner" />
            </div>
          )}
        </AsyncState>
      )}
    </section>
  );
}
