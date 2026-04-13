"use client";

import { useState, useCallback } from "react";
import {
  Play,
  Search,
  Loader2,
  AlertCircle,
  Inbox,
  ExternalLink,
  KeyRound,
} from "lucide-react";

interface Video {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
}

type CardState = "idle" | "loading" | "empty" | "error" | "success" | "no-key";

export default function YouTubeCard() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [state, setState] = useState<CardState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `/api/youtube?q=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();

      if (!res.ok) {
        if (data.missingKey) {
          setState("no-key");
          setErrorMsg(data.hint ?? data.error);
          return;
        }
        setState("error");
        setErrorMsg(data.error ?? "알 수 없는 오류가 발생했습니다.");
        return;
      }

      if (data.videos.length === 0) {
        setState("empty");
      } else {
        setVideos(data.videos);
        setState("success");
      }
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="group relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/20">
      {/* Accent top bar */}
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20">
            <Play className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              YouTube Search
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              API Key
            </span>
          </div>
        </div>
        <StatusIndicator state={state} />
      </div>

      {/* Search input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="동영상 검색..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={state === "loading" || !query.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "검색"
          )}
        </button>
      </div>

      {/* Content area */}
      <div className="min-h-[200px]">
        {state === "idle" && <IdleView />}
        {state === "loading" && <LoadingView />}
        {state === "empty" && <EmptyView query={query} />}
        {state === "error" && <ErrorView message={errorMsg} />}
        {state === "no-key" && <NoKeyView message={errorMsg} />}
        {state === "success" && <ResultsView videos={videos} />}
      </div>
    </div>
  );
}

function StatusIndicator({ state }: { state: CardState }) {
  const map: Record<CardState, { label: string; cls: string; icon: React.ReactNode }> = {
    idle: { label: "대기 중", cls: "bg-slate-600 text-slate-200", icon: null },
    loading: {
      label: "검색 중...",
      cls: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    empty: {
      label: "결과 없음",
      cls: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
      icon: <Inbox className="w-3.5 h-3.5" />,
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
    success: {
      label: "완료",
      cls: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
      icon: null,
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

function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
        <Search className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm text-slate-400">검색어를 입력하고 검색 버튼을 눌러주세요</p>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-32 h-20 rounded-lg bg-slate-700" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-700/60 rounded w-1/2" />
            <div className="h-3 bg-slate-700/40 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyView({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-slate-300 mb-1">검색 결과가 없습니다</p>
      <p className="text-xs text-slate-500">
        &quot;{query}&quot;에 대한 동영상을 찾을 수 없습니다
      </p>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-400 mb-1">오류가 발생했습니다</p>
      <p className="text-xs text-slate-400 max-w-[260px]">{message}</p>
    </div>
  );
}

function NoKeyView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center px-2">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <KeyRound className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-amber-400 mb-2">API Key가 필요합니다</p>
      <div className="rounded-lg bg-slate-800 border border-amber-500/20 p-3 text-left w-full">
        <p className="text-xs text-slate-300 mb-2">{message}</p>
        <div className="text-xs font-mono bg-slate-900 rounded p-2 text-amber-300/80">
          <span className="text-slate-500"># .env.local</span>
          <br />
          YOUTUBE_API_KEY=여기에_키_입력
        </div>
        <p className="text-xs text-slate-500 mt-2">
          키 발급:{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            Google Cloud Console
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}

function ResultsView({ videos }: { videos: Video[] }) {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
      {videos.map((video) => (
        <a
          key={video.videoId}
          href={`https://www.youtube.com/watch?v=${video.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 p-2 rounded-xl hover:bg-slate-700/50 transition-colors group/item"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-32 h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0 py-0.5">
            <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 group-hover/item:text-red-400 transition-colors">
              {decodeHtmlEntities(video.title)}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {video.channel}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDate(video.publishedAt)}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-600 group-hover/item:text-slate-400 flex-shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}

function decodeHtmlEntities(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => map[m] ?? m);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
