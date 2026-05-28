import type { Metadata } from "next";

import "./explore.css";

export const metadata: Metadata = {
  title: "말랑 이별 MBTI · 근처 짝궁",
  description: "이별 MBTI로 가까운 곳의 환상/파멸 조합을 만나보세요.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="explore-root min-h-[100dvh] antialiased relative">
      <div className="explore-blob explore-blob-a" aria-hidden />
      <div className="explore-blob explore-blob-b" aria-hidden />
      <div className="max-w-md mx-auto min-h-[100dvh] px-4 safe-area-pb explore-content">
        {children}
      </div>
    </div>
  );
}
