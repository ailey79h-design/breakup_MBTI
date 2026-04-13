import { cookies } from "next/headers";

const COOKIE_NAME = "gmail_session";

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  email?: string;
}

export async function getTokens(): Promise<GmailTokens | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function setTokens(tokens: GmailTokens): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(tokens)).toString("base64");
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearTokens(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getValidAccessToken(): Promise<{ token: string; email?: string } | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  if (Date.now() < tokens.expires_at - 60_000) {
    return { token: tokens.access_token, email: tokens.email };
  }

  if (!tokens.refresh_token) return null;

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const refreshed: GmailTokens = {
      access_token: data.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      email: tokens.email,
    };

    await setTokens(refreshed);
    return { token: refreshed.access_token, email: refreshed.email };
  } catch {
    return null;
  }
}
