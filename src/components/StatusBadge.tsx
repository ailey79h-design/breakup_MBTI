"use client";

import { Loader2, AlertCircle, Inbox } from "lucide-react";

export type Status = "idle" | "loading" | "empty" | "error";

const config: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  idle: {
    label: "대기 중",
    color: "bg-slate-600 text-slate-200",
    icon: null,
  },
  loading: {
    label: "로딩 중...",
    color: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  empty: {
    label: "데이터 없음",
    color: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
    icon: <Inbox className="w-3.5 h-3.5" />,
  },
  error: {
    label: "오류 발생",
    color: "bg-red-600/20 text-red-400 border border-red-500/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, color, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
}
