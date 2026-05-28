"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProfileDto } from "@/lib/validation/profile";

export type ProfileStatus = "idle" | "loading" | "success" | "error" | "empty";

export function useProfile(enabled: boolean) {
  const [status, setStatus] = useState<ProfileStatus>("idle");
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      const data = await res.json();
      if (res.status === 401) {
        setProfile(null);
        setStatus("empty");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "프로필을 불러오지 못했습니다.");
        return;
      }
      if (!data.profile) {
        setProfile(null);
        setStatus("empty");
        return;
      }
      setProfile(data.profile as ProfileDto);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("네트워크 오류");
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (payload: {
      displayName: string;
      mbtiType: string;
      lat: number;
      lng: number;
      instagramHandle?: string | null;
      gender?: string | null;
      ageRange?: string | null;
      locationConsent: true;
    }) => {
      setStatus("loading");
      setError("");
      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "저장 실패");
        return false;
      }
      setProfile(data.profile as ProfileDto);
      setStatus("success");
      return true;
    },
    []
  );

  const updatePrivacy = useCallback(
    async (patch: { isHidden?: boolean; discoverEnabled?: boolean }) => {
      setError("");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "설정 저장 실패");
        return false;
      }
      setProfile(data.profile as ProfileDto);
      return true;
    },
    []
  );

  return { status, profile, error, load, save, updatePrivacy };
}
