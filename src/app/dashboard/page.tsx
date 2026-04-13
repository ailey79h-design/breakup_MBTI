"use client";

import { Zap } from "lucide-react";
import YouTubeCard from "@/components/YouTubeCard";
import WeatherCard from "@/components/WeatherCard";
import GmailCard from "@/components/GmailCard";
import GeminiCard from "@/components/GeminiCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                API Multi-Connector
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Dashboard v1.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              시스템 정상
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">연결된 API 서비스</h2>
          <p className="text-[var(--text-secondary)]">
            YouTube 검색, 기상청 날씨 조회, Gmail 받은편지함, Gemini 영화 추천을 확인할 수 있습니다.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <YouTubeCard />
          <WeatherCard />
          <GmailCard />
          <GeminiCard />
        </div>
      </main>
    </div>
  );
}
