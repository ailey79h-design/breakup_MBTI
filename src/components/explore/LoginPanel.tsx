"use client";

import { useState } from "react";

import { AsyncState } from "@/components/ui/AsyncState";
import type { AuthStatus } from "@/hooks/useSupabaseAuth";

type LoginPanelProps = {
  authStatus: AuthStatus;
  configured: boolean;
  error: string;
  onGuestLogin: () => void;
  onGoogleLogin: () => void;
  onEmailLogin: (email: string) => Promise<boolean | void>;
};

export function LoginPanel({
  authStatus,
  configured,
  error,
  onGuestLogin,
  onGoogleLogin,
  onEmailLogin,
}: LoginPanelProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  if (!configured) {
    return (
      <div className="glass-card rounded-[2rem] p-6 text-center mb-4">
        <p className="text-sm font-bold text-rose-600 mb-2">Supabase 연결 필요</p>
        <p className="text-xs text-slate-500">.env.local에 Supabase 키를 설정해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] p-6 space-y-4 mb-4 fade-in-up">
      <p className="text-center text-sm font-bold text-slate-700 dark:text-slate-200">
        로그인
      </p>

      <AsyncState
        status={authStatus === "loading" ? "loading" : "idle"}
        loading={<p className="text-sm text-rose-400 text-center">세션 확인 중…</p>}
      >
        <button
          type="button"
          onClick={onGuestLogin}
          className="w-full py-4 btn-pink text-white rounded-3xl font-bold text-base shadow-lg shadow-rose-200 active:scale-95 transition-transform"
        >
          게스트로 시작
        </button>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full py-3 rounded-2xl border-2 border-rose-100 text-rose-500 font-bold text-sm dark:border-slate-600"
        >
          Google로 계속
        </button>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-rose-100 dark:border-slate-600 dark:bg-slate-800 px-3 py-3 text-sm"
          autoComplete="email"
        />

        <button
          type="button"
          disabled={!email.trim()}
          onClick={async () => {
            const ok = await onEmailLogin(email);
            if (ok) setEmailSent(true);
          }}
          className="w-full py-3 rounded-2xl border-2 border-rose-200 text-rose-500 font-bold text-sm disabled:opacity-40"
        >
          이메일 링크 받기
        </button>

        {emailSent && (
          <p className="text-xs text-center text-emerald-600 font-medium">메일함을 확인해 주세요</p>
        )}

        {error && <p className="text-xs text-center text-rose-500">{error}</p>}
      </AsyncState>
    </div>
  );
}
