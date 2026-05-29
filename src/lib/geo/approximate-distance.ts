import type { CoarseLocation } from "./coarse-location";

/** Haversine on coarse coords — approximate km, not turn-by-turn GPS */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function approximateDistanceKm(a: CoarseLocation, b: CoarseLocation): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatApproxDistance(km: number): string {
  if (km < 0.1) return "0.1km 거리";
  if (km < 10) return `${km.toFixed(1)}km 거리`;
  return `${Math.round(km)}km 거리`;
}
