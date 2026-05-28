import { NextRequest, NextResponse } from "next/server";

import {
  getProfileByUserId,
  saveProfileForUser,
  updatePrivacyForUser,
} from "@/lib/profile/save-profile";
import { createSupabaseAuthClient } from "@/lib/supabase/server-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { saveProfileSchema, updatePrivacySchema } from "@/lib/validation/profile";

async function requireUser() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다.", missingConfig: true },
        { status: 503 }
      ),
    };
  }

  const supabase = await createSupabaseAuthClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase 클라이언트 오류" }, { status: 503 }) };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const profile = await getProfileByUserId(auth.user.id);
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "프로필 조회 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth && auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = saveProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값 검증 실패", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const profile = await saveProfileForUser(auth.user.id, parsed.data);
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "프로필 저장 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth && auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = updatePrivacySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값 검증 실패", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const profile = await updatePrivacyForUser(auth.user.id, parsed.data);
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "설정 저장 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
