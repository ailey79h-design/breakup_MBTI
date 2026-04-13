import { NextResponse } from "next/server";
import { getTokens } from "@/lib/gmail-tokens";

export async function GET() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      authenticated: false,
      missingKey: true,
      hint: ".env.local에 GMAIL_CLIENT_ID와 GMAIL_CLIENT_SECRET을 설정해주세요.",
    });
  }

  const tokens = await getTokens();
  if (!tokens) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: tokens.email ?? "알 수 없음",
  });
}
