/** GPS 실시간 추적 대신, 반올림된 격자 좌표로 대략 위치 표현 */

export type CoarseLocation = {
  lat: number;
  lng: number;
  /** 캐시·인덱스용 키 (예: "37.51,127.04") */
  gridKey: string;
};

const DEFAULT_PRECISION = 2; // ~1.1km

function roundCoord(value: number, precision: number): number {
  const p = 10 ** precision;
  return Math.round(value * p) / p;
}

export function toCoarseLocation(
  lat: number,
  lng: number,
  precision = DEFAULT_PRECISION
): CoarseLocation {
  const coarseLat = roundCoord(lat, precision);
  const coarseLng = roundCoord(lng, precision);
  return {
    lat: coarseLat,
    lng: coarseLng,
    gridKey: `${coarseLat},${coarseLng}`,
  };
}

export function parseGridKey(gridKey: string): CoarseLocation | null {
  const parts = gridKey.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, gridKey };
}
