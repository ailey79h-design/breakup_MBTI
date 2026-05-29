"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { FunnelMatchScreen } from "@/components/explore/FunnelMatchScreen";
import { LandingHero } from "@/components/explore/LandingHero";
import {
  QuickProfileForm,
  type QuickProfileFormHandle,
} from "@/components/explore/QuickProfileForm";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { clearLocalSession, setLoggedIn } from "@/lib/session/local-profile";

type ExploreAppProps = {
  wantsMatches?: boolean;
  mbtiFromQuery?: string;
};

export function ExploreApp({
  wantsMatches = false,
  mbtiFromQuery: mbtiFromQueryProp,
}: ExploreAppProps) {
  const router = useRouter();
  const mbtiFromQuery = mbtiFromQueryProp?.toUpperCase();

  const [loggedIn, setLoggedInState] = useState(false);
  const profileFormRef = useRef<QuickProfileFormHandle>(null);

  const { ensureSession } = useAnonymousSession();
  const local = useLocalProfile();
  const { setMbti, saveQuick, syncToServer, profile, hasBasic, error } = local;

  const mbtiType = (mbtiFromQuery || profile?.mbti || "").toUpperCase();
  const hasValidMbti = /^[EI][NS][TF][PJ]$/.test(mbtiType);

  useEffect(() => {
    if (wantsMatches) {
      if (hasBasic) {
        setLoggedIn(true);
        setLoggedInState(true);
        void ensureSession();
      }
      return;
    }
    setLoggedIn(false);
    setLoggedInState(false);
  }, [wantsMatches, hasBasic, ensureSession]);

  useEffect(() => {
    if (mbtiFromQuery) setMbti(mbtiFromQuery);
  }, [mbtiFromQuery, setMbti]);

  const showMatchScreen = wantsMatches && hasValidMbti && hasBasic;
  const showHomeForm = !showMatchScreen;
  const needsProfileForMatch = wantsMatches && hasValidMbti && !hasBasic;

  const testHref = mbtiFromQuery
    ? `/breakup-mbti.html?mbti=${encodeURIComponent(mbtiFromQuery)}`
    : "/breakup-mbti.html";

  const saveProfile = useCallback(
    async (data: {
      nickname: string;
      instagramId: string;
      gender: string | null;
      ageRange: string | null;
    }) => {
      saveQuick(data);
      setLoggedIn(true);
      setLoggedInState(true);
      void ensureSession();
    },
    [saveQuick, ensureSession]
  );

  const handleStartTest = useCallback(() => {
    profileFormRef.current?.submit();
  }, []);

  const handleProfileSubmit = useCallback(
    (data: {
      nickname: string;
      instagramId: string;
      gender: string | null;
      ageRange: string | null;
    }) => {
      void saveProfile(data);
      router.push(testHref);
    },
    [saveProfile, router, testHref]
  );

  const handleSignOut = useCallback(() => {
    clearLocalSession();
    setLoggedInState(false);
    router.replace("/explore", { scroll: false });
  }, [router]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ExploreHeader onSignOut={loggedIn ? handleSignOut : undefined} />

      {showHomeForm && (
        <div className="flex flex-col flex-1 justify-center pb-8 fade-in">
          <LandingHero />

          <QuickProfileForm
            ref={profileFormRef}
            initial={profile}
            hideSubmit
            onSubmit={handleProfileSubmit}
          />
          {error && (
            <p className="text-xs text-center text-rose-500 mt-3 px-4">{error}</p>
          )}

          {needsProfileForMatch && (
            <p className="text-center text-xs text-slate-500 px-2 mt-3">
              짝궁 찾기를 위해 닉네임과 인스타를 입력한 뒤 테스트 시작하기를 눌러 주세요.
            </p>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleStartTest}
              className="block w-full py-5 btn-pink text-white rounded-3xl font-bold text-xl text-center shadow-xl shadow-rose-200 active:scale-95 transition-transform"
            >
              테스트 시작하기
            </button>
            {hasBasic && wantsMatches && hasValidMbti && (
              <Link
                href={`/explore?step=matches&mbti=${encodeURIComponent(mbtiType)}`}
                className="block w-full py-4 text-center border-2 border-rose-200 text-rose-500 rounded-3xl font-bold text-sm"
              >
                근처에서 나의 짝궁 찾기
              </Link>
            )}
          </div>
        </div>
      )}

      {showMatchScreen && (
            <FunnelMatchScreen mbtiType={mbtiType} onSyncLocation={syncToServer} />
      )}

      <p className="text-center text-xs text-slate-400 mt-auto pt-8 pb-4">
        더 만들고 있음 👀{" "}
        <a
          href="https://www.instagram.com/ailey79h"
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-400 font-bold"
        >
          @ailey79h
        </a>
      </p>
    </div>
  );
}
