import { z } from "zod";

const mbtiTypeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[EI][NS][TF][PJ]$/);

export const exploreNearbyRequestSchema = z.object({
  mbtiType: mbtiTypeSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.union([z.literal(1), z.literal(3), z.literal(5)]).default(3),
  matchType: z.enum(["perfect", "disaster", "nearby", "all"]).default("nearby"),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ExploreNearbyRequest = z.infer<typeof exploreNearbyRequestSchema>;

export type ExploreProfileRow = {
  id: string;
  user_id: string | null;
  display_name: string;
  mbti_type: string;
  location_grid: string;
  instagram_handle: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: string | null;
  age_range: string | null;
  is_hidden: boolean;
  discover_enabled: boolean;
};
