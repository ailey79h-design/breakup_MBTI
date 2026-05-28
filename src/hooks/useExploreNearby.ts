"use client";

import { useCallback, useState } from "react";

import type { PublicProfileDto } from "@/lib/validation/profile";

export type ExploreUiStatus = "idle" | "loading" | "success" | "error" | "empty";

export type RadiusKm = 1 | 3 | 5;
export type MatchFilter = "perfect" | "disaster" | "nearby" | "all";

export function useExploreNearby() {
  const [status, setStatus] = useState<ExploreUiStatus>("idle");
  const [items, setItems] = useState<PublicProfileDto[]>([]);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [configHint, setConfigHint] = useState("");

  const search = useCallback(
    async (params: {
      mbtiType: string;
      lat: number;
      lng: number;
      radiusKm?: RadiusKm;
      matchType?: MatchFilter;
    }) => {
      const r = params.radiusKm ?? radiusKm;
      setStatus("loading");
      setErrorMessage("");
      setConfigHint("");

      try {
        const res = await fetch("/api/explore/nearby", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mbtiType: params.mbtiType,
            lat: params.lat,
            lng: params.lng,
            radiusKm: r,
            matchType: params.matchType ?? "nearby",
            limit: 30,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error ?? "탐색에 실패했습니다.");
          if (data.missingConfig) {
            setConfigHint(".env.local Supabase 설정을 확인해 주세요.");
          }
          setItems([]);
          return;
        }

        const list = (data.items ?? []) as PublicProfileDto[];
        setItems(list);
        setStatus(list.length === 0 ? "empty" : "success");
      } catch {
        setStatus("error");
        setErrorMessage("네트워크 오류가 발생했습니다.");
        setItems([]);
      }
    },
    [radiusKm]
  );

  return {
    status,
    items,
    radiusKm,
    setRadiusKm,
    errorMessage,
    configHint,
    search,
  };
}
