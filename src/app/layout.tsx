import type { Metadata } from "next";
import "./globals.css";

/** Bump ?v= when replacing og-image.jpg so link previews / Kakao pick up the new file (CDN & SNS cache). */
const OG_IMAGE = "/og-image.jpg?v=3";

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
        url: OG_IMAGE,
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
    images: [OG_IMAGE],
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
