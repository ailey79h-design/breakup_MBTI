import { NextResponse } from "next/server";

/**
 * 카카오 JavaScript 키 (웹 SDK용 — 카카오개발자 콘솔에서 발급, 도메인 등록 필요)
 * 서버 env만 써서 클라이언트 번들에 심지 않고, 정적 HTML이 이 API로 읽어감
 */
export async function GET() {
  const key =
    process.env.KAKAO_JAVASCRIPT_KEY?.trim() ||
    process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim() ||
    "";
  return NextResponse.json({ key });
}
