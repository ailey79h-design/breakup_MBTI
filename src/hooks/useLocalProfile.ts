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

export type ProfileSyncResult =
  | { ok: true }
  | { ok: false; message: string };

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
    ): Promise<ProfileSyncResult> => {
      const local = readLocalProfile();
      if (!local || !hasBasicProfile(local)) {
        const message = "닉네임과 인스타 아이디를 먼저 입력해 주세요.";
        setError(message);
        return { ok: false, message };
      }

      const mbti = ((opts?.mbti ?? local.mbti) || "").toUpperCase();
      if (!/^[EI][NS][TF][PJ]$/.test(mbti)) {
        const message = "MBTI 테스트를 먼저 완료해 주세요.";
        setError(message);
        return { ok: false, message };
      }

      if (!configured) {
        writeLocalProfile({ mbti });
        setProfile(readLocalProfile());
        return { ok: true };
      }

      setError("");
      const sessionOk = await ensureSession();
      if (!sessionOk) {
        const message =
          "로그인 연결에 실패했어요. Supabase에서 익명 로그인이 켜져 있는지 확인해 주세요.";
        setError(message);
        return { ok: false, message };
      }

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

      const data = (await res.json()) as { error?: string; profile?: ProfileDto };
      if (!res.ok) {
        const message = data.error ?? "서버 동기화 실패";
        setError(message);
        return { ok: false, message };
      }

      if (data.profile) {
        const merged = writeLocalProfile(mapServerToLocal(data.profile));
        setProfile(merged);
      } else {
        writeLocalProfile({ mbti });
        setProfile(readLocalProfile());
      }
      return { ok: true };
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
