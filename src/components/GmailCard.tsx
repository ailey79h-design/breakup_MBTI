"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
  Inbox,
  KeyRound,
  ExternalLink,
  RefreshCw,
  User,
} from "lucide-react";

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

type CardState = "checking" | "no-key" | "logged-out" | "loading" | "success" | "empty" | "error";

function parseSender(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/"/g, ""), email: match[2] };
  return { name: raw, email: raw };
}

function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}

export default function GmailCard() {
  const [state, setState] = useState<CardState>("checking");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [hintMsg, setHintMsg] = useState("");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/me");
      const data = await res.json();

      if (data.missingKey) {
        setHintMsg(data.hint ?? "");
        setState("no-key");
        return;
      }

      if (data.authenticated) {
        setEmail(data.email ?? "");
        fetchMessages();
      } else {
        setState("logged-out");
      }
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다.");
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/gmail/messages");
      const data = await res.json();

      if (data.needsAuth) {
        setState("logged-out");
        return;
      }

      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error ?? "메일을 불러올 수 없습니다.");
        return;
      }

      if (data.messages.length === 0) {
        setState("empty");
      } else {
        setMessages(data.messages);
        setState("success");
      }
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다.");
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/gmail/auth";
  };

  const handleLogout = async () => {
    await fetch("/api/gmail/logout", { method: "POST" });
    setEmail("");
    setMessages([]);
    setState("logged-out");
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="group relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/20">
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
            <Mail className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Gmail Inbox
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              OAuth 2.0
            </span>
          </div>
        </div>
        <StatusIndicator state={state} />
      </div>

      {/* Auth bar */}
      {state !== "checking" && state !== "no-key" && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          {email ? (
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 truncate">{email}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">로그인하여 메일을 확인하세요</span>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {state === "success" && (
              <button
                onClick={fetchMessages}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="새로고침"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {email ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-700 hover:bg-red-600/20 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                로그아웃
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                Google 로그인
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[200px]">
        {state === "checking" && <CheckingView />}
        {state === "no-key" && <NoKeyView hint={hintMsg} />}
        {state === "logged-out" && <LoggedOutView onLogin={handleLogin} />}
        {state === "loading" && <LoadingView />}
        {state === "success" && <MessagesView messages={messages} />}
        {state === "empty" && <EmptyView />}
        {state === "error" && <ErrorView message={errorMsg} />}
      </div>
    </div>
  );
}

function StatusIndicator({ state }: { state: CardState }) {
  const map: Record<CardState, { label: string; cls: string; icon: React.ReactNode }> = {
    checking: {
      label: "확인 중...",
      cls: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    "no-key": {
      label: "키 필요",
      cls: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
    "logged-out": {
      label: "로그아웃",
      cls: "bg-slate-600 text-slate-200",
      icon: null,
    },
    loading: {
      label: "로딩 중...",
      cls: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    success: {
      label: "연결됨",
      cls: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
      icon: null,
    },
    empty: {
      label: "메일 없음",
      cls: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
      icon: <Inbox className="w-3.5 h-3.5" />,
    },
    error: {
      label: "오류",
      cls: "bg-red-600/20 text-red-400 border border-red-500/30",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
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

function CheckingView() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px]">
      <Loader2 className="w-8 h-8 text-slate-500 animate-spin mb-3" />
      <p className="text-sm text-slate-400">인증 상태 확인 중...</p>
    </div>
  );
}

function NoKeyView({ hint }: { hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center px-2">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <KeyRound className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-amber-400 mb-2">OAuth 2.0 설정이 필요합니다</p>
      <div className="rounded-lg bg-slate-800 border border-amber-500/20 p-3 text-left w-full">
        <p className="text-xs text-slate-300 mb-2">{hint}</p>
        <div className="text-xs font-mono bg-slate-900 rounded p-2 text-amber-300/80">
          <span className="text-slate-500"># .env.local</span>
          <br />
          GMAIL_CLIENT_ID=...
          <br />
          GMAIL_CLIENT_SECRET=...
        </div>
        <p className="text-xs text-slate-500 mt-2">
          설정:{" "}
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

function LoggedOutView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
        <LogIn className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm text-slate-400 mb-3">Google 계정으로 로그인하면</p>
      <p className="text-sm text-slate-400 mb-4">최근 받은 메일을 확인할 수 있습니다</p>
      <button
        onClick={onLogin}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        Google 로그인
      </button>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse p-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
          <div className="flex-1 space-y-1.5 py-0.5">
            <div className="h-3.5 bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-700/50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyView() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-slate-300 mb-1">받은 메일이 없습니다</p>
      <p className="text-xs text-slate-500">받은편지함이 비어 있습니다</p>
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

function MessagesView({ messages }: { messages: EmailMessage[] }) {
  return (
    <div className="space-y-1">
      {messages.map((msg) => {
        const sender = parseSender(msg.from);
        return (
          <div
            key={msg.id}
            className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-700/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-emerald-400">
                {sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {msg.subject}
                </p>
                <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">
                  {formatDate(msg.date)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {sender.name}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {msg.snippet}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
