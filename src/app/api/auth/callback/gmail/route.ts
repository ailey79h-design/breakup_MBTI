import { NextRequest, NextResponse } from "next/server";
import { setTokens, type GmailTokens } from "@/lib/gmail-tokens";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}?gmail_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?gmail_error=no_code`);
  }

  const clientId = process.env.GMAIL_CLIENT_ID!;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
  const redirectUri = process.env.GMAIL_REDIRECT_URI!;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      const msg = tokenData.error_description || tokenData.error || "token_exchange_failed";
      return NextResponse.redirect(`${baseUrl}?gmail_error=${encodeURIComponent(msg)}`);
    }

    let email: string | undefined;
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.email;
      }
    } catch {
      // email fetch failed — non-critical
    }

    const tokens: GmailTokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
      email,
    };

    await setTokens(tokens);

    return NextResponse.redirect(`${baseUrl}?gmail_auth=success`);
  } catch {
    return NextResponse.redirect(`${baseUrl}?gmail_error=server_error`);
  }
}
