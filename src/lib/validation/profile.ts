import { z } from "zod";

const mbtiTypeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[EI][NS][TF][PJ]$/);

const instagramSchema = z
  .string()
  .trim()
  .min(1, "인스타그램 아이디를 입력해 주세요.")
  .max(30)
  .transform((s) => s.replace(/^@/, ""));

export const genderSchema = z
  .enum(["female", "male", "other", "prefer_not"])
  .optional()
  .nullable();

export const ageRangeSchema = z
  .enum(["10s", "20s", "30s", "40s", "50plus"])
  .optional()
  .nullable();

export const saveProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  mbtiType: mbtiTypeSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  instagramHandle: instagramSchema,
  gender: genderSchema,
  ageRange: ageRangeSchema,
  locationConsent: z.literal(true, {
    message: "위치 이용 동의가 필요합니다.",
  }),
});

export const updatePrivacySchema = z.object({
  isHidden: z.boolean().optional(),
  discoverEnabled: z.boolean().optional(),
});

export type SaveProfileInput = z.infer<typeof saveProfileSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;

export type ProfileDto = {
  id: string;
  displayName: string;
  mbtiType: string;
  locationGrid: string;
  instagramHandle: string | null;
  gender: string | null;
  ageRange: string | null;
  isHidden: boolean;
  discoverEnabled: boolean;
  updatedAt: string;
};

export type PublicProfileDto = {
  id: string;
  displayName: string;
  mbtiType: string;
  instagramHandle: string | null;
  distanceKm: number;
  /** GPS가 아닌 Fallback 추천 시 표시 (예: 다른 지역) */
  distanceLabel?: string | null;
  matchType: "perfect" | "disaster" | "nearby";
};
