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
    return new GeoPositionError(
      "denied",
      "위치 권한이 꺼져 있어요. 주소창 왼쪽 자물쇠(ⓘ)에서 위치를 허용해 주세요."
    );
  }
  if (err.code === err.TIMEOUT) {
    return new GeoPositionError("timeout", "위치를 가져오는 데 시간이 너무 걸려요.");
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return new GeoPositionError(
      "unavailable",
      "이 기기에서 GPS를 사용할 수 없어요. Windows 설정에서 위치를 켜 주세요."
    );
  }
  return new GeoPositionError("unknown", "위치를 가져오지 못했어요.");
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

function watchPositionOnce(options: PositionOptions & { watchTimeoutMs?: number }): Promise<GeolocationPosition> {
  const watchTimeoutMs = options.watchTimeoutMs ?? 30_000;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        navigator.geolocation.clearWatch(watchId);
        finish(() => resolve(pos));
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        finish(() => reject(mapGeolocationError(err)));
      },
      options
    );

    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      finish(() =>
        reject(new GeoPositionError("timeout", "위치를 가져오는 데 시간이 너무 걸려요."))
      );
    }, watchTimeoutMs);
  });
}

/** 사용자 탭(체크) 직후 호출 */
export async function getCurrentPosition(): Promise<GeolocationPosition> {
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

  const strategies: PositionOptions[] = [
    { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 },
    { enableHighAccuracy: false, maximumAge: 0, timeout: 20_000 },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 25_000 },
  ];

  let lastError = new GeoPositionError("unknown", "위치를 가져오지 못했어요.");

  for (const opts of strategies) {
    try {
      return await getCurrentPositionOnce(opts);
    } catch (e) {
      if (e instanceof GeoPositionError) lastError = e;
    }
  }

  try {
    return await watchPositionOnce({
      enableHighAccuracy: false,
      maximumAge: 0,
      watchTimeoutMs: 30_000,
    });
  } catch (e) {
    if (e instanceof GeoPositionError) throw e;
    throw lastError;
  }
}
