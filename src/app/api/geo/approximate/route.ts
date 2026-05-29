import { NextResponse } from "next/server";

/** GPS 실패 시 대략 위치 (서울 시청 격자 중심) */
const DEFAULT = { lat: 37.5665, lng: 126.978 };

export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ ...DEFAULT, source: "default" });
    }
    const data = (await res.json()) as { latitude?: number; longitude?: number };
    if (
      typeof data.latitude === "number" &&
      typeof data.longitude === "number" &&
      Number.isFinite(data.latitude) &&
      Number.isFinite(data.longitude)
    ) {
      return NextResponse.json({
        lat: data.latitude,
        lng: data.longitude,
        source: "ip",
      });
    }
  } catch {
    /* fallback below */
  }

  return NextResponse.json({ ...DEFAULT, source: "default" });
}
