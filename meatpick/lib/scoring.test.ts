import { describe, expect, it } from "vitest";
import { MOCK_ANALYSIS } from "./mock";
import { buildReport, scorePack } from "./scoring";
import type { AiPack } from "./schema";

const pack = (over: Partial<AiPack> = {}): AiPack => ({
  id: 1,
  box2d: [0, 0, 500, 500],
  positionLabel: "왼쪽",
  metrics: { leanPercent: 70, marblingScore: 80, royalPartScore: 80, defectScore: 20 },
  confidence: 0.9,
  warnings: [],
  pros: [],
  cons: [],
  oneLiner: "",
  recommendedUse: "GRILL",
  trimmingGuide: "",
  ...over,
});

describe("scorePack", () => {
  it("이상 비율에 가까울수록 높다", () => {
    const ideal = scorePack(pack(), "pork_belly");
    const lean = scorePack(pack({ metrics: { ...pack().metrics, leanPercent: 95 } }), "pork_belly");
    expect(ideal).toBeGreaterThan(lean);
  });

  it("스티커 가림은 감점된다", () => {
    expect(scorePack(pack({ warnings: ["STICKER_OCCLUSION"] }), "pork_neck")).toBe(scorePack(pack(), "pork_neck") - 4);
  });

  it("0~100 범위를 벗어나지 않는다", () => {
    const worst = pack({
      metrics: { leanPercent: 0, marblingScore: 0, royalPartScore: 0, defectScore: 100 },
      warnings: ["STICKER_OCCLUSION"],
    });
    expect(scorePack(worst, "chuck_eye_roll")).toBe(0);
  });
});

describe("buildReport", () => {
  it("점수 순으로 순위를 매기고 1위를 bestPackId로 둔다", () => {
    const report = buildReport(MOCK_ANALYSIS.pork_belly, "pork_belly", "mock");
    if (!report.ok) throw new Error("expected ok");
    expect(report.packs.map((p) => p.rank)).toEqual([1, 2, 3]);
    expect(report.packs.map((p) => p.id)).toEqual([2, 1, 3]);
    expect(report.bestPackId).toBe(2);
    expect(report.packs[0].grade.tier).toBe("royal");
  });

  it("동점이면 확신도가 높은 팩이 앞선다", () => {
    const report = buildReport(
      {
        isValidInput: true,
        rejectReason: null,
        detectedMeatType: "pork_neck",
        packs: [pack({ id: 1, confidence: 0.5 }), pack({ id: 2, confidence: 0.9 })],
      },
      "pork_neck",
      "gemini",
    );
    if (!report.ok) throw new Error("expected ok");
    expect(report.bestPackId).toBe(2);
  });

  it("선택 부위와 감지 부위가 다르면 typeMismatch", () => {
    const report = buildReport({ ...MOCK_ANALYSIS.pork_neck, detectedMeatType: "pork_belly" }, "pork_neck", "gemini");
    expect(report.ok && report.typeMismatch).toBe(true);
  });

  it("유효하지 않은 입력은 거부 사유를 돌려준다", () => {
    const report = buildReport(
      { isValidInput: false, rejectReason: "NOT_MEAT", detectedMeatType: null, packs: [] },
      "pork_belly",
      "gemini",
    );
    expect(report).toEqual({ ok: false, source: "gemini", rejectReason: "NOT_MEAT" });
  });

  it("유효하다면서 팩이 없으면 NO_PACKS", () => {
    const report = buildReport(
      { isValidInput: true, rejectReason: null, detectedMeatType: "pork_belly", packs: [] },
      "pork_belly",
      "gemini",
    );
    expect(report.ok ? null : report.rejectReason).toBe("NO_PACKS");
  });
});
