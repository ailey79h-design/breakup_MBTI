"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { UserMatchCard } from "@/components/explore/UserMatchCard";
import { AsyncState } from "@/components/ui/AsyncState";
import { useFunnelRecommendations } from "@/hooks/useFunnelRecommendations";
import { GeoPositionError, getCurrentPosition } from "@/lib/geo/get-position";
import type { PublicProfileDto } from "@/lib/validation/profile";

type FunnelMatchScreenProps = {
  mbtiType: string;
  onSyncLocation: (lat: number, lng: number) => Promise<boolean>;
};

function MatchSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: PublicProfileDto[];
}) {
  if (items.length === 0) return null;

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

function MatchEmptyState({ onGoToResult }: { onGoToResult: () => void }) {
  return (
    <div className="glass-card rounded-[2rem] p-8 text-center mx-1 space-y-5">
      <p className="text-3xl">💕</p>
      <div className="space-y-2 text-sm text-slate-500 leading-relaxed">
        <p className="font-bold text-slate-600 dark:text-slate-200">
          아직 주변에서 만날 수 있는 사용자가 없어요 💕
        </p>
        <p>조금만 기다려 주세요.</p>
        <p className="text-xs text-slate-400">또는 테스트 결과를 다시 확인해보세요.</p>
      </div>
      <button
        type="button"
        onClick={onGoToResult}
        className="w-full py-4 btn-pink text-white rounded-3xl font-bold text-sm shadow-lg shadow-rose-200 active:scale-[0.98] transition-transform"
      >
        테스트 결과로 돌아가기
      </button>
    </div>
  );
}

export function FunnelMatchScreen({
  mbtiType,
  onSyncLocation,
}: FunnelMatchScreenProps) {
  const router = useRouter();
  const funnel = useFunnelRecommendations();
  const [geoError, setGeoError] = useState("");
  const [locationConsent, setLocationConsent] = useState(false);

  const locationSyncedRef = useRef(false);
  const fetchInFlightRef = useRef(false);
  const [locating, setLocating] = useState(false);

  const goToResultPage = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    window.location.href = "/breakup-mbti.html";
  }, [router]);

  const fetchMatchesWithLocation = useCallback(async () => {
    if (fetchInFlightRef.current) return;

    fetchInFlightRef.current = true;
    setLocating(true);
    setGeoError("");

    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (!locationSyncedRef.current) {
        const synced = await onSyncLocation(lat, lng);
        if (!synced) {
          setGeoError("프로필 동기화에 실패했습니다. 처음 화면에서 정보를 다시 입력해 주세요.");
          return;
        }
        locationSyncedRef.current = true;
      }

      await funnel.search({ mbtiType, lat, lng });
    } catch (e) {
      setGeoError(
        e instanceof GeoPositionError ? e.message : "위치를 가져오지 못했습니다."
      );
    } finally {
      fetchInFlightRef.current = false;
      setLocating(false);
    }
  }, [mbtiType, onSyncLocation, funnel.search]);

  const handleLocationConsentChange = useCallback(
    (checked: boolean) => {
      setLocationConsent(checked);
      setGeoError("");
      if (!checked) {
        locationSyncedRef.current = false;
        return;
      }
      void fetchMatchesWithLocation();
    },
    [fetchMatchesWithLocation]
  );

  useEffect(() => {
    if (!locationConsent) {
      locationSyncedRef.current = false;
    }
  }, [locationConsent]);

  useEffect(() => {
    if (!locationConsent) return;
    void fetchMatchesWithLocation();
  }, [mbtiType]); // eslint-disable-line react-hooks/exhaustive-deps -- MBTI만 바뀔 때 재검색

  const uiStatus =
    locating || (funnel.status === "idle" && locationConsent)
      ? "loading"
      : funnel.status;

  const showUnifiedList = funnel.tier === "all_users";
  const hasSectionResults =
    funnel.perfectItems.length > 0 || funnel.disasterItems.length > 0;
  const hasResults = funnel.items.length > 0 || hasSectionResults;

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
          <span className="text-rose-500 font-black italic">{mbtiType}</span> · 반경 5km 우선
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-4 mb-4 mx-1">
        <label className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <input
            type="checkbox"
            checked={locationConsent}
            onChange={(e) => handleLocationConsentChange(e.target.checked)}
            disabled={locating}
            className="mt-1 shrink-0"
          />
          <span>
            주변 사용자 추천을 위해 현재 위치를 사용합니다. GPS 좌표는 공개되지 않고
            거리만 표시됩니다.
          </span>
        </label>
      </div>

      {geoError && (
        <div className="text-center px-4 mb-3 space-y-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">{geoError}</p>
          {locationConsent && (
            <button
              type="button"
              onClick={() => void fetchMatchesWithLocation()}
              disabled={locating}
              className="text-xs font-bold text-rose-500 underline underline-offset-2 disabled:opacity-50"
            >
              위치 다시 가져오기
            </button>
          )}
        </div>
      )}

      {locating && locationConsent && (
        <p className="text-xs text-rose-400 text-center px-4 mb-3 animate-pulse">
          현재 위치를 가져오는 중이에요…
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
          status={uiStatus}
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
            <p className="text-sm text-rose-600 text-center px-4">{funnel.errorMessage}</p>
          }
          empty={<MatchEmptyState onGoToResult={goToResultPage} />}
        >
          {funnel.bannerMessage && (
            <div className="glass-card rounded-[1.5rem] px-4 py-3 mb-5 mx-1 text-center">
              <p className="text-sm font-bold text-rose-500 leading-relaxed">
                {funnel.bannerMessage}
              </p>
            </div>
          )}

          {hasResults && showUnifiedList && (
            <MatchSection
              title="테스트 참여자"
              subtitle="먼저 테스트한 사람들을 만나보세요"
              items={funnel.items}
            />
          )}

          {hasResults && !showUnifiedList && hasSectionResults && (
            <>
              <MatchSection
                title="환상의 조합"
                subtitle={
                  funnel.tier === "nearby_perfect"
                    ? "5km 이내 궁합이 찰떡인 사용자"
                    : "궁합이 찰떡인 사용자"
                }
                items={funnel.perfectItems}
              />
              <MatchSection
                title="파멸의 조합"
                subtitle={
                  funnel.tier === "nearby_perfect"
                    ? "5km 이내 흥미로운 인연"
                    : "흥미로운 인연"
                }
                items={funnel.disasterItems}
              />
            </>
          )}

          {hasResults && !showUnifiedList && !hasSectionResults && funnel.items.length > 0 && (
            <MatchSection
              title="추천"
              subtitle="더 많은 인연을 만나보세요"
              items={funnel.items}
            />
          )}
        </AsyncState>
      )}
    </div>
  );
}
