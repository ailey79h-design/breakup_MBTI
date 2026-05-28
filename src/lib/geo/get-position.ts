export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unknown";

export class GeoPositionError extends Error {
  code: GeoErrorCode;
  constructor(code: GeoErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeoPositionError("unavailable", "이 기기에서는 위치를 사용할 수 없어요."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeoPositionError("denied", "위치 권한이 필요해요. 설정에서 허용해 주세요."));
        } else if (err.code === err.TIMEOUT) {
          reject(new GeoPositionError("timeout", "위치를 가져오는 데 시간이 너무 걸려요."));
        } else {
          reject(new GeoPositionError("unknown", "위치를 가져오지 못했어요."));
        }
      },
      { enableHighAccuracy: true, maximumAge: 120_000, timeout: 15_000 }
    );
  });
}
