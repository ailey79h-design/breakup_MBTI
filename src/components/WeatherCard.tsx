"use client";

import { useState, useCallback } from "react";
import {
  CloudSun,
  Search,
  Loader2,
  AlertCircle,
  Inbox,
  KeyRound,
  ExternalLink,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  MapPin,
} from "lucide-react";

interface WeatherData {
  city: string;
  baseDate: string;
  baseTime: string;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  rainfall: string;
  precipitationType: string;
  skyCondition: string;
  description: string;
}

type CardState = "idle" | "loading" | "error" | "success" | "no-key";

const CITIES = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "제주", "수원", "춘천", "청주", "전주", "창원", "포항", "강릉",
  "목포", "여수", "안동",
];

export default function WeatherCard() {
  const [city, setCity] = useState("서울");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [state, setState] = useState<CardState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = useCallback(async () => {
    const trimmed = city.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.missingKey) {
          setState("no-key");
          setErrorMsg(data.hint ?? data.error);
          return;
        }
        setState("error");
        setErrorMsg(data.error ?? "알 수 없는 오류가 발생했습니다.");
        return;
      }

      setWeather(data);
      setState("success");
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    }
  }, [city]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="group relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/20">
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20">
            <CloudSun className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Weather
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              API Key · 기상청
            </span>
          </div>
        </div>
        <StatusIndicator state={state} />
      </div>

      {/* City input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            list="city-list"
            placeholder="도시 입력 (예: 서울)"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-colors"
          />
          <datalist id="city-list">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <button
          onClick={handleSearch}
          disabled={state === "loading" || !city.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "조회"
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {state === "idle" && <IdleView />}
        {state === "loading" && <LoadingView />}
        {state === "error" && <ErrorView message={errorMsg} />}
        {state === "no-key" && <NoKeyView message={errorMsg} />}
        {state === "success" && weather && <WeatherView data={weather} />}
      </div>
    </div>
  );
}

function StatusIndicator({ state }: { state: CardState }) {
  const map: Record<CardState, { label: string; cls: string; icon: React.ReactNode }> = {
    idle: { label: "대기 중", cls: "bg-slate-600 text-slate-200", icon: null },
    loading: {
      label: "조회 중...",
      cls: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    error: {
      label: "오류",
      cls: "bg-red-600/20 text-red-400 border border-red-500/30",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    "no-key": {
      label: "키 필요",
      cls: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
    success: {
      label: "정상",
      cls: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
      icon: null,
    },
  };
  const { label, cls, icon } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
        <Search className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm text-slate-400">도시를 입력하고 조회 버튼을 눌러주세요</p>
      <p className="text-xs text-slate-500 mt-1">기본값: 서울</p>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px]">
      <div className="space-y-4 w-full animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-slate-700 rounded w-1/3" />
            <div className="h-4 bg-slate-700/60 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-slate-700/40 rounded-xl" />
          <div className="h-16 bg-slate-700/40 rounded-xl" />
          <div className="h-16 bg-slate-700/40 rounded-xl" />
          <div className="h-16 bg-slate-700/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-400 mb-1">오류가 발생했습니다</p>
      <p className="text-xs text-slate-400 max-w-[260px]">{message}</p>
    </div>
  );
}

function NoKeyView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center px-2">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <KeyRound className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-medium text-amber-400 mb-2">API Key가 필요합니다</p>
      <div className="rounded-lg bg-slate-800 border border-amber-500/20 p-3 text-left w-full">
        <p className="text-xs text-slate-300 mb-2">{message}</p>
        <div className="text-xs font-mono bg-slate-900 rounded p-2 text-amber-300/80">
          <span className="text-slate-500"># .env.local</span>
          <br />
          WEATHER_API_KEY=발급받은_인증키
        </div>
        <p className="text-xs text-slate-500 mt-2">
          키 발급:{" "}
          <a
            href="https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15084084"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            공공데이터포털
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}

function getWeatherIcon(sky: string, pty: string) {
  if (pty === "비" || pty === "빗방울") return <CloudRain className="w-8 h-8 text-blue-400" />;
  if (pty === "눈" || pty === "눈날림") return <CloudSnow className="w-8 h-8 text-sky-300" />;
  if (pty === "비/눈" || pty === "빗방울눈날림") return <CloudRain className="w-8 h-8 text-indigo-400" />;
  if (sky === "맑음") return <Sun className="w-8 h-8 text-yellow-400" />;
  if (sky === "구름많음") return <CloudSun className="w-8 h-8 text-slate-300" />;
  if (sky === "흐림") return <Cloud className="w-8 h-8 text-slate-400" />;
  return <CloudSun className="w-8 h-8 text-blue-300" />;
}

function windDirToText(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatObsTime(baseDate: string, baseTime: string): string {
  const y = baseDate.slice(0, 4);
  const m = baseDate.slice(4, 6);
  const d = baseDate.slice(6, 8);
  const h = baseTime.slice(0, 2);
  return `${y}.${m}.${d} ${h}:00 기준`;
}

function WeatherView({ data }: { data: WeatherData }) {
  return (
    <div>
      {/* Main temp area */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          {getWeatherIcon(data.skyCondition, data.precipitationType)}
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">
              {data.temperature !== null ? `${data.temperature}` : "--"}
            </span>
            <span className="text-lg text-slate-400">°C</span>
          </div>
          <p className="text-sm text-blue-400 font-medium">{data.description}</p>
          <p className="text-xs text-slate-500">{data.city}</p>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <DetailTile
          icon={<Thermometer className="w-4 h-4 text-orange-400" />}
          label="체감온도"
          value={data.feelsLike !== null ? `${data.feelsLike}°C` : (data.temperature !== null ? `${data.temperature}°C` : "--")}
        />
        <DetailTile
          icon={<Droplets className="w-4 h-4 text-cyan-400" />}
          label="습도"
          value={data.humidity !== null ? `${data.humidity}%` : "--"}
        />
        <DetailTile
          icon={<Wind className="w-4 h-4 text-teal-400" />}
          label="바람"
          value={
            data.windSpeed !== null
              ? `${data.windSpeed}m/s${data.windDirection !== null ? ` ${windDirToText(data.windDirection)}` : ""}`
              : "--"
          }
        />
        <DetailTile
          icon={<CloudRain className="w-4 h-4 text-indigo-400" />}
          label="강수량"
          value={data.rainfall === "강수없음" || data.rainfall === "0" ? "없음" : `${data.rainfall}`}
        />
      </div>

      {/* Observation time */}
      <p className="text-xs text-slate-600 text-right mt-3">
        {formatObsTime(data.baseDate, data.baseTime)}
      </p>
    </div>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
