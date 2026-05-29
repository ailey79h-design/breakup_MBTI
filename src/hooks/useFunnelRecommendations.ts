"use client";

import { useCallback, useRef, useState } from "react";

import type { FunnelFallbackTier } from "@/lib/explore/fetch-funnel-matches";
import type { PublicProfileDto } from "@/lib/validation/profile";

export type FunnelUiStatus = "idle" | "loading" | "success" | "error" | "empty";

export function useFunnelRecommendations() {
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState<FunnelUiStatus>("idle");
  const [tier, setTier] = useState<FunnelFallbackTier | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [perfectItems, setPerfectItems] = useState<PublicProfileDto[]>([]);
  const [disasterItems, setDisasterItems] = useState<PublicProfileDto[]>([]);
  const [items, setItems] = useState<PublicProfileDto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const search = useCallback(
    async (params: { mbtiType: string; lat: number; lng: number }) => {
      const requestId = ++requestIdRef.current;
      setStatus("loading");
      setErrorMessage("");

      try {
        const res = await fetch("/api/explore/funnel", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await res.json();

        if (requestId !== requestIdRef.current) return;

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error ?? "추천을 불러오지 못했습니다.");
          setPerfectItems([]);
          setDisasterItems([]);
          setItems([]);
          return;
        }

        const perfect = (data.perfectItems ?? []) as PublicProfileDto[];
        const disaster = (data.disasterItems ?? []) as PublicProfileDto[];
        const list = (data.items ?? []) as PublicProfileDto[];

        setTier(data.tier ?? null);
        setBannerMessage(data.bannerMessage ?? null);
        setPerfectItems(perfect);
        setDisasterItems(disaster);
        setItems(list);

        const hasAny = list.length > 0 || perfect.length > 0 || disaster.length > 0;
        setStatus(hasAny ? "success" : "empty");
      } catch {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
        setErrorMessage("네트워크 오류가 발생했습니다.");
        setPerfectItems([]);
        setDisasterItems([]);
        setItems([]);
      }
    },
    []
  );

  return {
    status,
    tier,
    bannerMessage,
    perfectItems,
    disasterItems,
    items,
    errorMessage,
    search,
  };
}
