import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchFunnelRecommendations } from "@/lib/explore/fetch-funnel-matches";
import { getProfileByUserId } from "@/lib/profile/save-profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseAuthClient } from "@/lib/supabase/server-auth";

const funnelRequestSchema = z.object({
  mbtiType: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[EI][NS][TF][PJ]$/),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = funnelRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값 검증 실패", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다.", missingConfig: true },
      { status: 503 }
    );
  }

  const authClient = await createSupabaseAuthClient();
  let excludeUserId: string | null = null;
  if (authClient) {
    const {
      data: { user },
    } = await authClient.auth.getUser();
    excludeUserId = user?.id ?? null;

    if (user) {
      const self = await getProfileByUserId(user.id);
      if (self && !self.discoverEnabled) {
        return NextResponse.json(
          { error: "근처 탐색이 꺼져 있어요. 내 프로필에서 켤 수 있어요." },
          { status: 403 }
        );
      }
    }
  }

  try {
    const result = await fetchFunnelRecommendations(parsed.data, { excludeUserId });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "탐색 중 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
