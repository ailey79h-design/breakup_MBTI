"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { FunnelMatchScreen } from "@/components/explore/FunnelMatchScreen";
import { LandingHero } from "@/components/explore/LandingHero";
import { QuickProfileForm } from "@/components/explore/QuickProfileForm";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import {
  clearLocalSession,
  isLoggedIn,
  setLoggedIn,
} from "@/lib/session/local-profile";

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

  const { ensureSession } = useAnonymousSession();
  const local = useLocalProfile();
  const { setMbti, saveQuick, syncToServer, profile, error } = local;

  const mbtiType = (mbtiFromQuery || profile?.mbti || "").toUpperCase();
  const hasValidMbti = /^[EI][NS][TF][PJ]$/.test(mbtiType);

  useEffect(() => {
    setLoggedInState(isLoggedIn());
  }, [profile?.updatedAt]);

  useEffect(() => {
    if (mbtiFromQuery) setMbti(mbtiFromQuery);
  }, [mbtiFromQuery, setMbti]);

  const showMatchScreen = wantsMatches && hasValidMbti && loggedIn;
  const showHomeForm = !showMatchScreen;

  const handleLogin = useCallback(
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
      if (wantsMatches) {
        router.replace(
          hasValidMbti ? `/explore?step=matches&mbti=${mbtiType}` : "/explore",
          { scroll: false }
        );
      }
    },
    [saveQuick, ensureSession, wantsMatches, hasValidMbti, mbtiType, router]
  );

  const handleSignOut = useCallback(() => {
    clearLocalSession();
    setLoggedInState(false);
    router.replace("/explore", { scroll: false });
  }, [router]);

  const testHref = mbtiFromQuery
    ? `/breakup-mbti.html?mbti=${encodeURIComponent(mbtiFromQuery)}`
    : "/breakup-mbti.html";

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ExploreHeader onSignOut={loggedIn ? handleSignOut : undefined} />

      {showHomeForm && (
        <div className="flex flex-col flex-1 justify-center pb-8 fade-in">
          <LandingHero />

          <QuickProfileForm
            initial={profile}
            submitLabel="로그인하기"
            hideSubmit={loggedIn}
            onSubmit={(data) => void handleLogin(data)}
          />
          {error && (
            <p className="text-xs text-center text-rose-500 mt-3 px-4">{error}</p>
          )}

          {loggedIn && (
            <div className="mt-6 space-y-3">
              {wantsMatches && !hasValidMbti && (
                <p className="text-center text-xs text-slate-500 px-2">
                  MBTI 테스트를 완료하면 짝궁 찾기를 이용할 수 있어요
                </p>
              )}
              <Link
                href={testHref}
                className="block w-full py-5 btn-pink text-white rounded-3xl font-bold text-xl text-center shadow-xl shadow-rose-200 active:scale-95 transition-transform"
              >
                테스트 시작하기
              </Link>
              {wantsMatches && hasValidMbti && (
                <Link
                  href={`/explore?step=matches&mbti=${encodeURIComponent(mbtiType)}`}
                  className="block w-full py-4 text-center border-2 border-rose-200 text-rose-500 rounded-3xl font-bold text-sm"
                >
                  근처에서 나의 짝궁 찾기
                </Link>
              )}
            </div>
          )}
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
