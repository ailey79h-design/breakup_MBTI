"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BottomNav, type ExploreTab } from "@/components/explore/BottomNav";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { HomeMenuGrid } from "@/components/explore/HomeMenuGrid";
import { LandingHero } from "@/components/explore/LandingHero";
import { LoginPanel } from "@/components/explore/LoginPanel";
import { MatchListPanel } from "@/components/explore/MatchListPanel";
import { ProfileSettingsPanel } from "@/components/explore/ProfileSettingsPanel";
import { ResultSummary } from "@/components/explore/ResultSummary";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function ExploreApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ExploreTab) || "home";
  const mbtiFromQuery = searchParams.get("mbti")?.toUpperCase();

  const [tab, setTab] = useState<ExploreTab>(initialTab);
  const [dark, setDark] = useState(false);

  const auth = useSupabaseAuth();
  const local = useLocalProfile();
  const { setMbti, saveQuick, syncToServer, updatePrivacy, profile, hasBasic, hasMbti, error } =
    local;

  const needsLogin = auth.status === "signed_out" || auth.status === "loading";

  useEffect(() => {
    const root = document.querySelector(".explore-root");
    if (!root) return;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    if (mbtiFromQuery) setMbti(mbtiFromQuery);
  }, [mbtiFromQuery, setMbti]);

  useEffect(() => {
    if (!needsLogin) return;
    if (tab === "home" || tab === "test") return;
    setTab("home");
    router.replace("/explore", { scroll: false });
  }, [needsLogin, tab, router]);

  useEffect(() => {
    if (tab === "test") {
      const q = mbtiFromQuery ? `?mbti=${mbtiFromQuery}` : "";
      window.location.href = `/breakup-mbti.html${q}`;
    }
  }, [tab, mbtiFromQuery]);

  const mbtiType = (mbtiFromQuery || profile?.mbti || "").toUpperCase();

  const guardedTab = (t: ExploreTab) => {
    if (needsLogin && t !== "home" && t !== "test") {
      setTab("home");
      return;
    }
    if (!hasBasic && !["home", "test", "profile"].includes(t)) {
      setTab("profile");
      return;
    }
    if (!hasMbti && ["nearby", "perfect", "disaster", "result"].includes(t)) {
      setTab("result");
      return;
    }
    setTab(t);
    const q = new URLSearchParams();
    q.set("tab", t);
    if (mbtiFromQuery) q.set("mbti", mbtiFromQuery);
    router.replace(`/explore?${q.toString()}`, { scroll: false });
  };

  const matchProps = hasMbti
    ? {
        mbtiType,
        profileVersion: profile?.updatedAt,
        onSyncLocation: syncToServer,
      }
    : null;

  const testHref = mbtiFromQuery
    ? `/breakup-mbti.html?mbti=${encodeURIComponent(mbtiFromQuery)}`
    : "/breakup-mbti.html";

  return (
    <div className="flex flex-col min-h-[100dvh] pb-20">
      <ExploreHeader
        dark={dark}
        onThemeToggle={() => setDark((d) => !d)}
        onSignOut={auth.status === "signed_in" ? () => void auth.signOut() : undefined}
      />

      {tab === "home" && (
        <div className="flex flex-col pb-4 fade-in">
          <LandingHero />

          {needsLogin && (
            <LoginPanel
              authStatus={auth.status}
              configured={auth.configured}
              error={auth.error}
              onGuestLogin={() => void auth.signInAnonymously()}
              onGoogleLogin={() => void auth.signInWithGoogle()}
              onEmailLogin={auth.signInWithEmail}
            />
          )}

          <Link
            href={testHref}
            className="block w-full py-5 btn-pink text-white rounded-3xl font-bold text-xl text-center shadow-xl shadow-rose-200 active:scale-95 transition-transform"
          >
            테스트 시작하기
          </Link>

          {!needsLogin && (
            <div className="mt-6">
              <HomeMenuGrid
                onSelect={guardedTab}
                nickname={profile?.nickname}
                instagramId={profile?.instagramId}
                mbti={profile?.mbti}
              />
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-8">
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
      )}

      {tab === "result" && (
        <div className="px-1">
          <ResultSummary
            profile={profile}
            mbtiFromQuery={mbtiFromQuery}
            onFindMatch={() => guardedTab("nearby")}
          />
        </div>
      )}

      {tab === "profile" && (
        <>
          {needsLogin ? (
            <div className="px-1">
              <LoginPanel
                authStatus={auth.status}
                configured={auth.configured}
                error={auth.error}
                onGuestLogin={() => void auth.signInAnonymously()}
                onGoogleLogin={() => void auth.signInWithGoogle()}
                onEmailLogin={auth.signInWithEmail}
              />
            </div>
          ) : (
            <ProfileSettingsPanel
              profile={profile}
              error={error}
              onSaveQuick={(data) => saveQuick(data)}
              onMbtiChange={setMbti}
              onPrivacyChange={updatePrivacy}
            />
          )}
        </>
      )}

      {tab === "nearby" && matchProps && (
        <MatchListPanel
          badge="FIND YOUR MATCH"
          title="근처에서 나의 짝궁 찾기"
          subtitle="거리 + MBTI로 주변 사용자를 추천해요"
          matchType="nearby"
          {...matchProps}
        />
      )}

      {tab === "perfect" && matchProps && (
        <MatchListPanel
          title="환상의 조합"
          subtitle="궁합이 찰떡인 주변 사용자만 모아봤어요"
          matchType="perfect"
          {...matchProps}
        />
      )}

      {tab === "disaster" && matchProps && (
        <MatchListPanel
          title="파멸의 조합"
          subtitle="궁합이 최악인 주변 사용자"
          matchType="disaster"
          {...matchProps}
        />
      )}

      {needsLogin && !["home", "test", "profile"].includes(tab) && (
        <div className="glass-card rounded-[2rem] p-8 text-center mx-1">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
            홈에서 로그인해 주세요
          </p>
          <button
            type="button"
            onClick={() => guardedTab("home")}
            className="btn-pink text-white px-6 py-3 rounded-2xl font-bold text-sm"
          >
            홈으로
          </button>
        </div>
      )}

      {!needsLogin && !hasBasic && !["home", "test", "profile"].includes(tab) && (
        <div className="glass-card rounded-[2rem] p-8 text-center mx-1">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
            프로필을 먼저 입력해 주세요
          </p>
          <button
            type="button"
            onClick={() => guardedTab("profile")}
            className="btn-pink text-white px-6 py-3 rounded-2xl font-bold text-sm"
          >
            프로필 설정
          </button>
        </div>
      )}

      {!needsLogin && hasBasic && !hasMbti && ["nearby", "perfect", "disaster"].includes(tab) && (
        <div className="glass-card rounded-[2rem] p-8 text-center mx-1">
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
      )}

      <BottomNav active={tab} onChange={guardedTab} />
    </div>
  );
}
