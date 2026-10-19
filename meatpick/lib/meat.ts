import type { MeatType, RecommendedUse, RejectReason, WarningCode } from "./schema";

type MeatConfig = {
  label: string;
  emoji: string;
  idealLean: number;
  // 총점 가중치 (합 1). lean은 이상 비율과의 근접도, defect는 반전해서 쓴다.
  weights: { lean: number; marbling: number; royal: number; defect: number };
  metricLabels: { lean: string; marbling: string; royal: string };
};

export const MEAT: Record<MeatType, MeatConfig> = {
  pork_belly: {
    label: "삼겹살",
    emoji: "🐷",
    idealLean: 70,
    weights: { lean: 0.35, marbling: 0.25, royal: 0.25, defect: 0.15 },
    metricLabels: { lean: "살코기 : 지방", marbling: "층 분포 균일도", royal: "갈비 쪽 부위" },
  },
  pork_neck: {
    label: "목살",
    emoji: "🐖",
    idealLean: 75,
    weights: { lean: 0.15, marbling: 0.35, royal: 0.35, defect: 0.15 },
    metricLabels: { lean: "살코기 : 지방", marbling: "지방선 분포", royal: "알목심 형태" },
  },
  chuck_eye_roll: {
    label: "척아이롤",
    emoji: "🐮",
    idealLean: 75,
    weights: { lean: 0.05, marbling: 0.35, royal: 0.4, defect: 0.2 },
    metricLabels: { lean: "살코기 : 지방", marbling: "마블링 밀도", royal: "살치살·새우살" },
  },
};

export const USE_LABEL: Record<RecommendedUse, string> = {
  GRILL: "구이용",
  STEW: "국·찌개용",
  BRAISE: "수육·찜용",
  STIR_FRY: "볶음용",
};

export const WARNING_LABEL: Record<WarningCode, string> = {
  STICKER_OCCLUSION: "스티커 가림",
  GLARE: "빛 반사",
  BLUR: "흔들림",
  PARTIAL_VIEW: "일부만 보임",
  LOW_LIGHT: "어두움",
};

export const REJECT_MESSAGE: Record<RejectReason, { title: string; hint: string }> = {
  NOT_MEAT: { title: "고기 팩을 찾지 못했어요", hint: "매대의 포장육 팩이 화면에 들어오게 다시 찍어주세요." },
  WRONG_TYPE: { title: "아직 지원하지 않는 고기예요", hint: "삼겹살 · 목살 · 척아이롤 팩을 찍어주세요." },
  NO_PACKS: { title: "팩이 보이지 않아요", hint: "2~4개 팩이 한 화면에 모두 들어오게 찍어주세요." },
  TOO_BLURRY: { title: "사진이 흐려요", hint: "휴대폰을 잠시 고정한 뒤 다시 찍어주세요." },
};
