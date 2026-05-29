import {
  GeoPositionError,
  getCurrentPosition,
} from "@/lib/geo/get-position";

export type ViewerCoords = {
  lat: number;
  lng: number;
  source: "gps" | "ip" | "default";
};

export type ResolveViewerCoordsResult = {
  coords: ViewerCoords;
  /** GPS 대신 대체 위치를 쓴 경우 안내 */
  warning?: string;
};

async function fetchApproximateFromServer(): Promise<ViewerCoords> {
  const res = await fetch("/api/geo/approximate", { credentials: "same-origin" });
  if (!res.ok) throw new Error("approximate geo failed");
  const data = (await res.json()) as { lat: number; lng: number; source?: string };
  return {
    lat: data.lat,
    lng: data.lng,
    source: data.source === "ip" ? "ip" : "default",
  };
}

/**
 * GPS 우선 → 실패 시 IP/기본 위치. 항상 좌표를 반환해 추천 API를 막지 않음.
 */
export async function resolveViewerCoords(): Promise<ResolveViewerCoordsResult> {
  try {
    const pos = await getCurrentPosition();
    return {
      coords: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        source: "gps",
      },
    };
  } catch (e) {
    const gpsMessage =
      e instanceof GeoPositionError
        ? e.message
        : "위치를 가져오지 못했어요.";

    try {
      const approx = await fetchApproximateFromServer();
      const via =
        approx.source === "ip"
          ? "네트워크 기준 대략 위치"
          : "기본 위치(서울)";
      return {
        coords: approx,
        warning: `${gpsMessage} ${via}로 추천해 드릴게요.`,
      };
    } catch {
      return {
        coords: { lat: 37.5665, lng: 126.978, source: "default" },
        warning: `${gpsMessage} 서울 기준으로 추천해 드릴게요.`,
      };
    }
  }
}
