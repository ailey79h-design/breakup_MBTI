/** 광고 슬롯 ID — UI는 placeholder, 추후 AdSense/직접 영업 연동 */

export type AdPlacementId =
  | "explore_list_inline"
  | "explore_footer_banner"
  | "result_screen_footer";

export type AdPlacement = {
  id: AdPlacementId;
  label: string;
  /** 모바일 우선 높이(px) */
  minHeight: number;
  enabled: boolean;
};

export const AD_PLACEMENTS: Record<AdPlacementId, AdPlacement> = {
  explore_list_inline: {
    id: "explore_list_inline",
    label: "탐색 목록 인라인",
    minHeight: 90,
    enabled: false,
  },
  explore_footer_banner: {
    id: "explore_footer_banner",
    label: "탐색 하단 배너",
    minHeight: 60,
    enabled: false,
  },
  result_screen_footer: {
    id: "result_screen_footer",
    label: "결과 화면 하단",
    minHeight: 60,
    enabled: false,
  },
};
