import { z } from "zod";

// 이 파일이 타입·런타임 검증·Gemini responseSchema의 단일 원본이다.

export const MEAT_TYPES = ["pork_belly", "pork_neck", "chuck_eye_roll"] as const;
export const meatTypeSchema = z.enum(MEAT_TYPES);
export type MeatType = z.infer<typeof meatTypeSchema>;

export const WARNING_CODES = [
  "STICKER_OCCLUSION", // 가격표 스티커가 고기를 가림
  "GLARE", // 비닐 빛 반사
  "BLUR", // 흔들림·초점 불량
  "PARTIAL_VIEW", // 팩 일부가 화면 밖
  "LOW_LIGHT", // 어두움
] as const;
export const warningCodeSchema = z.enum(WARNING_CODES);
export type WarningCode = z.infer<typeof warningCodeSchema>;

export const REJECT_REASONS = ["NOT_MEAT", "WRONG_TYPE", "NO_PACKS", "TOO_BLURRY"] as const;
export const rejectReasonSchema = z.enum(REJECT_REASONS);
export type RejectReason = z.infer<typeof rejectReasonSchema>;

export const USES = ["GRILL", "STEW", "BRAISE", "STIR_FRY"] as const;
export const useSchema = z.enum(USES);
export type RecommendedUse = z.infer<typeof useSchema>;

const score = z.number().min(0).max(100);
const coord = z.number().min(0).max(1000);

// AI가 돌려주는 팩 단위 원시 분석. 총점·순위는 서버(lib/scoring.ts)가 계산한다.
export const aiPackSchema = z.object({
  id: z.number().int().min(1),
  box2d: z
    .tuple([coord, coord, coord, coord])
    .describe("[ymin, xmin, ymax, xmax], 이미지 기준 0~1000 정규화 좌표"),
  positionLabel: z.string().describe("예: 왼쪽 위"),
  metrics: z.object({
    leanPercent: score.describe("살코기 면적 비율(%)"),
    marblingScore: score.describe("마블링·지방선 분포의 고른 정도"),
    royalPartScore: score.describe("부위별 로얄 부위 포함도"),
    defectScore: score.describe("떡지방·힘줄·찢어짐 등 결점 정도, 높을수록 나쁨"),
  }),
  confidence: z.number().min(0).max(1).describe("사진 상태를 고려한 판단 확신도"),
  warnings: z.array(warningCodeSchema),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  oneLiner: z.string().describe("이 팩의 순위를 설명하는 한 줄 평"),
  recommendedUse: useSchema,
  trimmingGuide: z.string(),
});
export type AiPack = z.infer<typeof aiPackSchema>;

export const aiAnalysisSchema = z.object({
  isValidInput: z.boolean(),
  rejectReason: rejectReasonSchema.nullable(),
  detectedMeatType: meatTypeSchema.nullable(),
  packs: z.array(aiPackSchema),
});
export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;

// 클라이언트 → /api/analyze-meat 요청 본문
export const analyzeRequestSchema = z.object({
  meatType: meatTypeSchema,
  imageBase64: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// 서버 점수 계산 후 화면이 쓰는 최종 리포트
export type GradeTier = "royal" | "good" | "fair" | "poor";

export type ScoredPack = AiPack & {
  totalScore: number;
  rank: number;
  grade: { tier: GradeTier; label: string };
};

export type MeatReport =
  | {
      ok: true;
      source: "mock" | "gemini";
      meatType: MeatType;
      detectedMeatType: MeatType | null;
      typeMismatch: boolean;
      totalPacksDetected: number;
      bestPackId: number;
      packs: ScoredPack[]; // rank 오름차순
    }
  | {
      ok: false;
      source: "mock" | "gemini";
      rejectReason: RejectReason;
    };
