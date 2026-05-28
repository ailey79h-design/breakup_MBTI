import type { AdPlacementId } from "@/lib/ads/placements";
import { AD_PLACEMENTS } from "@/lib/ads/placements";

type AdSlotProps = {
  placementId: AdPlacementId;
};

/** 수익화 슬롯 placeholder — enabled 시 추후 스크립트 주입 */
export function AdSlot({ placementId }: AdSlotProps) {
  const slot = AD_PLACEMENTS[placementId];
  if (!slot.enabled) return null;

  return (
    <div
      className="w-full rounded-2xl bg-rose-50/50 border border-dashed border-rose-200 flex items-center justify-center text-[10px] text-rose-300"
      style={{ minHeight: slot.minHeight }}
      data-ad-slot={placementId}
      aria-hidden
    >
      광고
    </div>
  );
}
