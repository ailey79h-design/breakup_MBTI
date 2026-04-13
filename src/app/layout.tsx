import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://breakup-mbti.vercel.app"),
  title: "말랑 이별 MBTI 💔",
  description: "👀 소름… 내 이별 성격 나옴",
  openGraph: {
    title: "말랑 이별 MBTI 💔",
    description: "👀 소름… 내 이별 성격 나옴",
    url: "https://breakup-mbti.vercel.app",
    siteName: "말랑 이별 MBTI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "말랑 이별 MBTI 💔",
    description: "👀 소름… 내 이별 성격 나옴",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
