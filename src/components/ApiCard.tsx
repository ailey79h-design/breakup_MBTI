"use client";

import { useState } from "react";
import StatusBadge, { type Status } from "./StatusBadge";
import type { LucideIcon } from "lucide-react";

interface ApiCardProps {
  title: string;
  description: string;
  authType: string;
  icon: LucideIcon;
  accentColor: string;
}

const statusCycle: Status[] = ["idle", "loading", "empty", "error"];

export default function ApiCard({
  title,
  description,
  authType,
  icon: Icon,
  accentColor,
}: ApiCardProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  const cycleStatus = () => {
    setStatusIndex((prev) => (prev + 1) % statusCycle.length);
  };

  return (
    <div className="group relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:bg-[var(--bg-card-hover)] hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1">
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {authType}
            </span>
          </div>
        </div>
        <StatusBadge status={statusCycle[statusIndex]} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
        {description}
      </p>

      {/* Placeholder content area */}
      <div className="rounded-xl bg-slate-800/50 border border-dashed border-slate-600 p-8 flex flex-col items-center justify-center text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-400 mb-1">
          다음 단계에서 구현 예정
        </p>
        <p className="text-xs text-slate-500">
          API 연동 후 이 영역에 데이터가 표시됩니다
        </p>
      </div>

      {/* Status demo button */}
      <button
        onClick={cycleStatus}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500 cursor-pointer"
      >
        상태 미리보기 (클릭하여 전환)
      </button>
    </div>
  );
}
