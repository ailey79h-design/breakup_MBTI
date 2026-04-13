import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Multi-Connector Dashboard",
  description: "YouTube, Weather, Gmail API를 한 곳에서 관리하는 대시보드",
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
