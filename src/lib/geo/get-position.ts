export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unknown";

export class GeoPositionError extends Error {
  code: GeoErrorCode;
  constructor(code: GeoErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function mapGeolocationError(err: GeolocationPositionError): GeoPositionError {
  if (err.code === err.PERMISSION_DENIED) {
    return new GeoPositionError("denied", "위치 권한이 필요해요. 브라우저에서 허용해 주세요.");
  }
  if (err.code === err.TIMEOUT) {
    return new GeoPositionError("timeout", "위치를 가져오는 데 시간이 너무 걸려요. 다시 시도해 주세요.");
  }
  return new GeoPositionError("unknown", "위치를 가져오지 못했어요. 다시 시도해 주세요.");
}

function getCurrentPositionOnce(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => reject(mapGeolocationError(err)),
      options
    );
  });
}

/** 사용자 탭(체크) 직후 호출 — 저정밀도 먼저 시도 후 고정밀도 재시도 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return Promise.reject(
      new GeoPositionError(
        "unavailable",
        "위치는 HTTPS 또는 localhost에서만 사용할 수 있어요."
      )
    );
  }

  if (!navigator.geolocation) {
    return Promise.reject(
      new GeoPositionError("unavailable", "이 기기에서는 위치를 사용할 수 없어요.")
    );
  }

  const base: PositionOptions = { maximumAge: 120_000, timeout: 20_000 };

  return getCurrentPositionOnce({ ...base, enableHighAccuracy: false }).catch(
    () => getCurrentPositionOnce({ ...base, enableHighAccuracy: true, timeout: 25_000 })
  );
}
