import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 영화 추천 전문가입니다. 사용자가 보고 싶은 영화 취향을 자유롭게 설명하면, 그에 딱 맞는 영화 1편만 추천해주세요.

규칙:
- 반드시 영화 1편만 추천합니다.
- 사용자의 입력에서 장르, 분위기, 속도감, 시대감, 선호/비선호 요소를 파악하세요.
- 추천 형식: 영화 제목(개봉연도)을 먼저 밝히고, 왜 이 영화가 사용자 취향에 맞는지 자연스럽고 짧게 설명하세요.
- 너무 장황하지 않게, 3~5문장 이내로 작성하세요.
- 한국어로 답변하세요.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY가 설정되지 않았습니다.",
        hint: ".env.local 파일에 Google AI Studio에서 발급받은 Gemini API Key를 설정해주세요.",
        missingKey: true,
      },
      { status: 503 }
    );
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const userMessage = body.message?.trim();
  if (!userMessage || userMessage.length === 0) {
    return NextResponse.json({ error: "영화 취향을 입력해주세요." }, { status: 400 });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n사용자 취향:\n${userMessage}` }] },
        ],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const msg = errData?.error?.message ?? `Gemini API 오류 (${res.status})`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "Gemini로부터 응답을 받지 못했습니다. 다시 시도해주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({ recommendation: text });
  } catch {
    return NextResponse.json(
      { error: "Gemini API 서버에 연결할 수 없습니다." },
      { status: 502 }
    );
  }
}
