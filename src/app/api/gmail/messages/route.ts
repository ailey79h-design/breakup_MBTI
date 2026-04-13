import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/gmail-tokens";

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailMessageDetail {
  id: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
  };
  internalDate: string;
}

export async function GET() {
  const auth = await getValidAccessToken();

  if (!auth) {
    return NextResponse.json(
      { error: "로그인이 필요합니다.", needsAuth: true },
      { status: 401 }
    );
  }

  try {
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX",
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    if (listRes.status === 401) {
      return NextResponse.json(
        { error: "인증이 만료되었습니다. 다시 로그인해주세요.", needsAuth: true },
        { status: 401 }
      );
    }

    if (!listRes.ok) {
      const errData = await listRes.json().catch(() => null);
      const msg = errData?.error?.message ?? `Gmail API 오류 (${listRes.status})`;
      return NextResponse.json({ error: msg }, { status: listRes.status });
    }

    const listData = await listRes.json();
    const messageIds: GmailMessage[] = listData.messages ?? [];

    if (messageIds.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const details = await Promise.all(
      messageIds.map(async (m) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        if (!res.ok) return null;
        return res.json() as Promise<GmailMessageDetail>;
      })
    );

    const messages = details
      .filter((d): d is GmailMessageDetail => d !== null)
      .map((d) => {
        const headers = d.payload.headers;
        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

        return {
          id: d.id,
          subject: getHeader("Subject") || "(제목 없음)",
          from: getHeader("From"),
          date: getHeader("Date"),
          snippet: d.snippet,
        };
      });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json(
      { error: "Gmail 서버에 연결할 수 없습니다." },
      { status: 502 }
    );
  }
}
