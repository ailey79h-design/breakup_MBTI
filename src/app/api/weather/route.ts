import { NextRequest, NextResponse } from "next/server";

const CITY_GRID: Record<string, { nx: number; ny: number; label: string }> = {
  서울: { nx: 60, ny: 127, label: "서울특별시" },
  부산: { nx: 98, ny: 76, label: "부산광역시" },
  대구: { nx: 89, ny: 90, label: "대구광역시" },
  인천: { nx: 55, ny: 124, label: "인천광역시" },
  광주: { nx: 58, ny: 74, label: "광주광역시" },
  대전: { nx: 67, ny: 100, label: "대전광역시" },
  울산: { nx: 102, ny: 84, label: "울산광역시" },
  세종: { nx: 66, ny: 103, label: "세종특별자치시" },
  제주: { nx: 52, ny: 38, label: "제주특별자치도" },
  수원: { nx: 60, ny: 121, label: "수원시" },
  춘천: { nx: 73, ny: 134, label: "춘천시" },
  청주: { nx: 69, ny: 106, label: "청주시" },
  전주: { nx: 63, ny: 89, label: "전주시" },
  창원: { nx: 90, ny: 77, label: "창원시" },
  포항: { nx: 102, ny: 94, label: "포항시" },
  강릉: { nx: 92, ny: 131, label: "강릉시" },
  목포: { nx: 50, ny: 67, label: "목포시" },
  여수: { nx: 73, ny: 66, label: "여수시" },
  안동: { nx: 91, ny: 106, label: "안동시" },
};

function getKSTNow(): Date {
  const utc = new Date();
  return new Date(utc.getTime() + 9 * 60 * 60 * 1000);
}

function getBaseDateTime(): { base_date: string; base_time: string } {
  const kst = getKSTNow();

  let hour = kst.getUTCHours();
  let day = kst.getUTCDate();
  let month = kst.getUTCMonth() + 1;
  let year = kst.getUTCFullYear();
  const minutes = kst.getUTCMinutes();

  if (minutes < 40) {
    hour -= 1;
    if (hour < 0) {
      hour = 23;
      day -= 1;
      if (day < 1) {
        month -= 1;
        if (month < 1) {
          month = 12;
          year -= 1;
        }
        day = new Date(year, month, 0).getDate();
      }
    }
  }

  const base_date = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const base_time = `${String(hour).padStart(2, "0")}00`;

  return { base_date, base_time };
}

interface KmaItem {
  category: string;
  obsrValue?: string;
  fcstValue?: string;
}

interface KmaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      items?: { item?: KmaItem[] };
    };
  };
}

const PTY_MAP: Record<string, string> = {
  "0": "",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "5": "빗방울",
  "6": "빗방울눈날림",
  "7": "눈날림",
};

const SKY_MAP: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

function calcWindChill(temp: number, windMs: number): number | null {
  const windKmh = windMs * 3.6;
  if (temp > 10 || windKmh < 4.8) return null;
  return Math.round(
    (13.12 + 0.6215 * temp - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temp * Math.pow(windKmh, 0.16)) * 10
  ) / 10;
}

async function fetchKma(endpoint: string, serviceKey: string, params: Record<string, string>): Promise<KmaResponse> {
  const url = new URL(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/${endpoint}`);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "60");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`기상청 API HTTP ${res.status}`);
  return res.json();
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() || "서울";

  const grid = CITY_GRID[city];
  if (!grid) {
    const available = Object.keys(CITY_GRID).join(", ");
    return NextResponse.json(
      { error: `"${city}"은(는) 지원하지 않는 지역입니다.`, available },
      { status: 400 }
    );
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweathermap_api_key_here" || apiKey.length < 10) {
    return NextResponse.json(
      {
        error: "WEATHER_API_KEY가 설정되지 않았습니다.",
        hint: ".env.local 파일에 공공데이터포털(data.go.kr)에서 발급받은 기상청 단기예보 서비스 인증키를 설정해주세요.",
        missingKey: true,
      },
      { status: 503 }
    );
  }

  const { base_date, base_time } = getBaseDateTime();
  const gridParams = { base_date, base_time, nx: String(grid.nx), ny: String(grid.ny) };

  try {
    const [ncstRes, fcstRes] = await Promise.all([
      fetchKma("getUltraSrtNcst", apiKey, gridParams),
      fetchKma("getUltraSrtFcst", apiKey, gridParams),
    ]);

    const ncstCode = ncstRes.response.header.resultCode;
    if (ncstCode !== "00") {
      return NextResponse.json(
        { error: `기상청 API 오류: ${ncstRes.response.header.resultMsg} (${ncstCode})` },
        { status: 502 }
      );
    }

    const ncstItems = ncstRes.response.body?.items?.item ?? [];
    const fcstItems = fcstRes.response.body?.items?.item ?? [];

    const obs: Record<string, string> = {};
    for (const item of ncstItems) {
      if (item.obsrValue !== undefined) obs[item.category] = item.obsrValue;
    }

    let skyValue = "";
    for (const item of fcstItems) {
      if (item.category === "SKY" && item.fcstValue) {
        skyValue = item.fcstValue;
        break;
      }
    }

    const temp = parseFloat(obs["T1H"] ?? "");
    const humidity = parseFloat(obs["REH"] ?? "");
    const windSpeed = parseFloat(obs["WSD"] ?? "");
    const windDir = parseFloat(obs["VEC"] ?? "");
    const rain = obs["RN1"] ?? "0";
    const ptyCode = obs["PTY"] ?? "0";

    const feelsLike = calcWindChill(temp, windSpeed);

    const ptyDesc = PTY_MAP[ptyCode] || "";
    const skyDesc = SKY_MAP[skyValue] || "";
    const description = ptyDesc || skyDesc || "관측 중";

    return NextResponse.json({
      city: grid.label,
      baseDate: base_date,
      baseTime: base_time,
      temperature: isNaN(temp) ? null : temp,
      feelsLike,
      humidity: isNaN(humidity) ? null : humidity,
      windSpeed: isNaN(windSpeed) ? null : windSpeed,
      windDirection: isNaN(windDir) ? null : windDir,
      rainfall: rain,
      precipitationType: ptyDesc,
      skyCondition: skyDesc,
      description,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: `기상청 API 연결 실패: ${msg}` }, { status: 502 });
  }
}
