"use client";

import { useCallback, useEffect, useState } from "react";

import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import {
  hasBasicProfile,
  hasMbti,
  readLocalProfile,
  writeLocalProfile,
  type LocalProfile,
} from "@/lib/session/local-profile";
import type { ProfileDto } from "@/lib/validation/profile";

export type LocalProfileStatus = "loading" | "ready";

function mapServerToLocal(dto: ProfileDto): LocalProfile {
  return {
    nickname: dto.displayName,
    instagramId: (dto.instagramHandle ?? "").replace(/^@/, ""),
    mbti: dto.mbtiType,
    gender: dto.gender,
    ageRange: dto.ageRange,
    isHidden: dto.isHidden,
    discoverEnabled: dto.discoverEnabled,
    updatedAt: dto.updatedAt,
  };
}

export function useLocalProfile() {
  const { configured, ensureSession } = useAnonymousSession();
  const [status, setStatus] = useState<LocalProfileStatus>("loading");
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [error, setError] = useState("");

  const hydrate = useCallback(() => {
    setProfile(readLocalProfile());
    setStatus("ready");
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const saveQuick = useCallback(
    (data: {
      nickname: string;
      instagramId: string;
      gender: string | null;
      ageRange: string | null;
      mbti?: string;
    }) => {
      const next = writeLocalProfile({
        nickname: data.nickname,
        instagramId: data.instagramId,
        gender: data.gender,
        ageRange: data.ageRange,
        ...(data.mbti ? { mbti: data.mbti } : {}),
      });
      setProfile(next);
      return next;
    },
    []
  );

  const syncToServer = useCallback(
    async (
      lat: number,
      lng: number,
      opts?: { mbti?: string }
    ): Promise<boolean> => {
      const local = readLocalProfile();
      if (!local || !hasBasicProfile(local)) {
        setError("닉네임과 인스타 아이디를 먼저 입력해 주세요.");
        return false;
      }

      const mbti = ((opts?.mbti ?? local.mbti) || "ENTP").toUpperCase();
      if (!/^[EI][NS][TF][PJ]$/.test(mbti)) {
        setError("MBTI 테스트를 먼저 완료해 주세요.");
        return false;
      }

      setError("");
      if (configured) await ensureSession();

      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: local.nickname,
          mbtiType: mbti,
          lat,
          lng,
          instagramHandle: local.instagramId,
          gender: local.gender,
          ageRange: local.ageRange,
          locationConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "서버 동기화 실패");
        return false;
      }

      const merged = writeLocalProfile(mapServerToLocal(data.profile as ProfileDto));
      setProfile(merged);
      return true;
    },
    [configured, ensureSession]
  );

  const updatePrivacy = useCallback(
    async (patch: { isHidden?: boolean; discoverEnabled?: boolean }) => {
      const local = readLocalProfile();
      if (local) {
        writeLocalProfile({
          isHidden: patch.isHidden ?? local.isHidden,
          discoverEnabled: patch.discoverEnabled ?? local.discoverEnabled,
        });
        setProfile(readLocalProfile());
      }

      if (!configured) return true;
      await ensureSession();
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "설정 저장 실패");
        return false;
      }
      return true;
    },
    [configured, ensureSession]
  );

  const setMbti = useCallback((mbti: string) => {
    const next = writeLocalProfile({ mbti: mbti.toUpperCase() });
    setProfile(next);
  }, []);

  return {
    status,
    profile,
    error,
    configured,
    hasBasic: hasBasicProfile(profile),
    hasMbti: hasMbti(profile),
    saveQuick,
    syncToServer,
    updatePrivacy,
    setMbti,
    refresh: hydrate,
  };
}
