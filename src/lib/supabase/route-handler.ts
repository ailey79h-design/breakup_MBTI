import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** App Router API — request 쿠키에서 Supabase 세션 읽기 */
export function createSupabaseRouteClient(request: NextRequest) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return { supabase: null, applyCookies: (r: NextResponse) => r };
  }

  let cookieResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookieResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  return {
    supabase,
    applyCookies: (response: NextResponse) => {
      cookieResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });
      return response;
    },
  };
}
