"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type FunnelStep = "login" | "ready" | "matches";

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
  const { setMbti, saveQuick, syncToServer, profile, hasMbti, error } = local;

  const mbtiType = (mbtiFromQuery || profile?.mbti || "").toUpperCase();

  useEffect(() => {
    setLoggedInState(isLoggedIn());
  }, []);

  useEffect(() => {
    if (mbtiFromQuery) setMbti(mbtiFromQuery);
  }, [mbtiFromQuery, setMbti]);

  const step: FunnelStep = useMemo(() => {
    if (wantsMatches && hasMbti && mbtiType) return "matches";
    if (!loggedIn) return "login";
    return "ready";
  }, [wantsMatches, hasMbti, mbtiType, loggedIn]);

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
      router.replace("/explore", { scroll: false });
    },
    [saveQuick, ensureSession, router]
  );

  const handleSignOut = useCallback(() => {
    clearLocalSession();
    setLoggedInState(false);
    router.replace("/explore", { scroll: false });
  }, [router]);

  const testHref = "/breakup-mbti.html";

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ExploreHeader onSignOut={loggedIn ? handleSignOut : undefined} />

      {step === "login" && (
        <div className="flex flex-col flex-1 justify-center pb-8 fade-in">
          <LandingHero />
          <QuickProfileForm
            initial={profile}
            submitLabel="로그인하기"
            onSubmit={(data) => void handleLogin(data)}
          />
          {error && (
            <p className="text-xs text-center text-rose-500 mt-3 px-4">{error}</p>
          )}
        </div>
      )}

      {step === "ready" && (
        <div className="flex flex-col flex-1 justify-center items-center pb-12 fade-in">
          <LandingHero />
          <Link
            href={testHref}
            className="w-full py-5 btn-pink text-white rounded-3xl font-bold text-xl text-center shadow-xl shadow-rose-200 active:scale-95 transition-transform"
          >
            테스트 시작하기
          </Link>
        </div>
      )}

      {step === "matches" && (
        <>
          {!hasMbti || !/^[EI][NS][TF][PJ]$/.test(mbtiType) ? (
            <div className="glass-card rounded-[2rem] p-8 text-center mx-1 fade-in">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                MBTI 테스트를 먼저 완료해 주세요
              </p>
              <Link
                href={testHref}
                className="inline-block btn-pink text-white px-6 py-3 rounded-2xl font-bold text-sm"
              >
                테스트 시작하기
              </Link>
            </div>
          ) : (
            <FunnelMatchScreen
              mbtiType={mbtiType}
              profileVersion={profile?.updatedAt}
              onSyncLocation={syncToServer}
            />
          )}
        </>
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
