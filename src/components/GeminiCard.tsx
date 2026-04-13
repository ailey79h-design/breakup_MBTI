"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Clapperboard,
  Loader2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  SendHorizontal,
  RotateCcw,
} from "lucide-react";

type CardState = "idle" | "loading" | "success" | "error" | "no-key";

const PLACEHOLDER =
  "예: 머리 아픈 건 싫고, 몰입감 있고 반전 있는 스릴러 영화 보고 싶어. 너무 오래된 영화는 싫어.";

export default function GeminiCard() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [state, setState] = useState<CardState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [hintMsg, setHintMsg] = useState("");

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");
    setResult("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.missingKey) {
          setHintMsg(data.hint ?? "");
          setState("no-key");
          return;
        }
        setState("error");
        setErrorMsg(data.error ?? "알 수 없는 오류가 발생했습니다.");
        return;
      }

      if (!data.recommendation) {
        setState("error");
        setErrorMsg("추천 결과가 비어 있습니다. 다시 시도해주세요.");
        return;
      }

      setResult(data.recommendation);
      setState("success");
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    }
  }, [input]);

  const handleReset = () => {
    setInput("");
    setResult("");
    setState("idle");
    setErrorMsg("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div className="group relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/20 md:col-span-2 lg:col-span-3">
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Gemini Movie Recommender
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              API Key · Generative AI
            </span>
          </div>
        </div>
        <StatusIndicator state={state} />
      </div>

      {state === "no-key" ? (
        <NoKeyView hint={hintMsg} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Input */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-300 mb-2">
              어떤 영화가 보고 싶으세요?
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER}
              rows={5}
              className="flex-1 min-h-[120px] p-4 rounded-xl bg-slate-800 border border-slate-600 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-colors resize-none"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSubmit}
                disabled={state === "loading" || !input.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    추천 생성 중...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4" />
                    추천 받기
                  </>
                )}
              </button>
              {(state === "success" || state === "error") && (
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-2">Ctrl+Enter로 바로 전송</p>
          </div>

          {/* Right: Result */}
          <div className="min-h-[200px] flex flex-col">
            <label className="text-sm font-medium text-slate-300 mb-2">
              추천 결과
            </label>
            <div className="flex-1 rounded-xl bg-slate-800/60 border border-slate-700/50 p-4">
              {state === "idle" && <IdleResultView />}
              {state === "loading" && <LoadingResultView />}
              {state === "success" && <SuccessResultView text={result} />}
              {state === "error" && <ErrorResultView message={errorMsg} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ state }: { state: CardState }) {
  const map: Record<CardState, { label: string; cls: string; icon: React.ReactNode }> = {
    idle: { label: "대기 중", cls: "bg-slate-600 text-slate-200", icon: null },
    loading: {
      label: "생성 중...",
      cls: "bg-purple-600/20 text-purple-400 border border-purple-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    success: {
      label: "추천 완료",
      cls: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
      icon: null,
    },
    error: {
      label: "오류",
      cls: "bg-red-600/20 text-red-400 border border-red-500/30",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    "no-key": {
      label: "키 필요",
      cls: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
  };
  const { label, cls, icon } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function IdleResultView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-6">
      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
        <Clapperboard className="w-6 h-6 text-purple-400/50" />
      </div>
      <p className="text-sm text-slate-400">보고 싶은 영화 스타일을 적고</p>
      <p className="text-sm text-slate-400">&quot;추천 받기&quot;를 눌러주세요</p>
    </div>
  );
}

function LoadingResultView() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-purple-400 font-medium mb-1">Gemini가 영화를 고르는 중...</p>
      <div className="space-y-2 w-full mt-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-2/3" />
        <div className="h-3 bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-700/60 rounded w-5/6" />
        <div className="h-3 bg-slate-700/40 rounded w-3/4" />
      </div>
    </div>
  );
}

function SuccessResultView({ text }: { text: string }) {
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-purple-400">Gemini 추천</span>
      </div>
      <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}

function ErrorResultView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-400 mb-1">오류가 발생했습니다</p>
      <p className="text-xs text-slate-400 max-w-[280px]">{message}</p>
    </div>
  );
}

function NoKeyView({ hint }: { hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <KeyRound className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-amber-400 mb-2">API Key가 필요합니다</p>
      <div className="rounded-lg bg-slate-800 border border-amber-500/20 p-3 text-left max-w-md w-full">
        <p className="text-xs text-slate-300 mb-2">{hint}</p>
        <div className="text-xs font-mono bg-slate-900 rounded p-2 text-amber-300/80">
          <span className="text-slate-500"># .env.local</span>
          <br />
          GEMINI_API_KEY=여기에_키_입력
        </div>
        <p className="text-xs text-slate-500 mt-2">
          키 발급:{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            Google AI Studio
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
