import { MEAT, USE_LABEL } from "./meat";
import type { AiAnalysis, AiPack, GradeTier, MeatReport, MeatType, ScoredPack } from "./schema";

// AI 원시 분석 → 총점·순위가 붙은 리포트.
// 순위를 AI에게 맡기지 않고 여기서 계산해야 점수와 순위가 어긋나지 않는다.

const STICKER_PENALTY = 4;

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export function scorePack(pack: AiPack, meatType: MeatType): number {
  const { idealLean, weights } = MEAT[meatType];
  const m = pack.metrics;
  const leanFit = clamp(100 - Math.abs(m.leanPercent - idealLean) * 2.5);
  const raw =
    weights.lean * leanFit +
    weights.marbling * m.marblingScore +
    weights.royal * m.royalPartScore +
    weights.defect * (100 - m.defectScore);
  const penalty = pack.warnings.includes("STICKER_OCCLUSION") ? STICKER_PENALTY : 0;
  return Math.round(clamp(raw - penalty));
}

function gradeFor(rank: number, score: number, pack: AiPack): ScoredPack["grade"] {
  const use = USE_LABEL[pack.recommendedUse];
  let tier: GradeTier;
  let label: string;
  if (rank === 1 && score >= 80) {
    tier = "royal";
    label = `👑 로얄팩 · ${use}`;
  } else if (score >= 70) {
    tier = "good";
    label = `추천 · ${use}`;
  } else if (score >= 55) {
    tier = "fair";
    label = `무난 · ${use}`;
  } else {
    tier = "poor";
    label = `비추천 · ${use}`;
  }
  return { tier, label };
}

export function buildReport(
  analysis: AiAnalysis,
  meatType: MeatType,
  source: "mock" | "gemini",
): MeatReport {
  if (!analysis.isValidInput || analysis.packs.length === 0) {
    return { ok: false, source, rejectReason: analysis.rejectReason ?? "NO_PACKS" };
  }

  const ranked = analysis.packs
    .map((pack) => ({ pack, totalScore: scorePack(pack, meatType) }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore || b.pack.confidence - a.pack.confidence || a.pack.id - b.pack.id,
    )
    .map(({ pack, totalScore }, i) => ({
      ...pack,
      totalScore,
      rank: i + 1,
      grade: gradeFor(i + 1, totalScore, pack),
    }));

  return {
    ok: true,
    source,
    meatType,
    detectedMeatType: analysis.detectedMeatType,
    typeMismatch: analysis.detectedMeatType !== null && analysis.detectedMeatType !== meatType,
    totalPacksDetected: ranked.length,
    bestPackId: ranked[0].id,
    packs: ranked,
  };
}
