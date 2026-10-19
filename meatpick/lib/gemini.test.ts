import { ApiError } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { analyzeWithGemini, GeminiError, parseModelText, RESPONSE_SCHEMA } from "./gemini";
import { MOCK_ANALYSIS } from "./mock";
import type { AnalyzeRequest } from "./schema";

const req: AnalyzeRequest = { meatType: "chuck_eye_roll", imageBase64: "AAAA", mimeType: "image/jpeg" };
const reply = (text: string | undefined) => ({ text }) as Awaited<ReturnType<typeof import("@google/genai").GoogleGenAI.prototype.models.generateContent>>;

// 스키마 키워드만 모은다 (properties 아래의 필드 이름은 건너뜀)
function collectKeywords(node: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectKeywords(n, keys));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) {
      keys.add(k);
      if (k === "properties") Object.values(v as object).forEach((s) => collectKeywords(s, keys));
      else collectKeywords(v, keys);
    }
  return keys;
}

describe("RESPONSE_SCHEMA", () => {
  it("Gemini responseJsonSchema가 지원하는 키만 쓴다", () => {
    const supported = new Set([
      "type", "description", "enum", "items", "prefixItems", "minItems", "maxItems", "minimum", "maximum",
      "anyOf", "properties", "additionalProperties", "required",
    ]);
    expect([...collectKeywords(RESPONSE_SCHEMA)].filter((k) => !supported.has(k))).toEqual([]);
  });

  it("고정 길이 배열에 items:false를 남기지 않는다", () => {
    expect(JSON.stringify(RESPONSE_SCHEMA)).not.toContain('"items":false');
  });
});

describe("parseModelText", () => {
  it("뒤집힌 좌표와 중복 id를 바로잡는다", () => {
    const raw = structuredClone(MOCK_ANALYSIS.pork_neck);
    raw.packs[0].box2d = [500, 400, 100, 50];
    raw.packs.forEach((p) => (p.id = 7));
    const parsed = parseModelText(JSON.stringify(raw));
    expect(parsed?.packs[0].box2d).toEqual([100, 50, 500, 400]);
    expect(parsed?.packs.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("JSON이 아니거나 스키마를 벗어나면 null", () => {
    expect(parseModelText("not json")).toBeNull();
    expect(parseModelText(undefined)).toBeNull();
    expect(parseModelText(JSON.stringify({ isValidInput: true }))).toBeNull();
  });
});

describe("analyzeWithGemini", () => {
  it("이미지·시스템 지시·JSON 스키마를 담아 호출하고 리포트를 만든다", async () => {
    const generate = vi.fn().mockResolvedValue(reply(JSON.stringify(MOCK_ANALYSIS.chuck_eye_roll)));
    const report = await analyzeWithGemini(req, { apiKey: "k", generate });

    const params = generate.mock.calls[0][0];
    expect(params.model).toBe("gemini-3.6-flash");
    expect(params.contents[0].parts[0]).toEqual({ inlineData: { mimeType: "image/jpeg", data: "AAAA" } });
    expect(params.config.responseMimeType).toBe("application/json");
    expect(params.config.responseJsonSchema).toBe(RESPONSE_SCHEMA);
    expect(params.config.systemInstruction).toContain("척아이롤");

    expect(report.ok && report.source).toBe("gemini");
    expect(report.ok && report.bestPackId).toBe(3);
  });

  it("GEMINI_MODEL로 모델을 바꿀 수 있다", async () => {
    const generate = vi.fn().mockResolvedValue(reply(JSON.stringify(MOCK_ANALYSIS.pork_belly)));
    await analyzeWithGemini(req, { apiKey: "k", model: "gemini-x", generate });
    expect(generate.mock.calls[0][0].model).toBe("gemini-x");
  });

  it("첫 응답이 깨지면 한 번 더 시도한다", async () => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce(reply("{broken"))
      .mockResolvedValueOnce(reply(JSON.stringify(MOCK_ANALYSIS.pork_belly)));
    const report = await analyzeWithGemini(req, { apiKey: "k", generate });
    expect(generate).toHaveBeenCalledTimes(2);
    expect(report.ok).toBe(true);
  });

  it("두 번 다 깨지면 502", async () => {
    const generate = vi.fn().mockResolvedValue(reply("{broken"));
    await expect(analyzeWithGemini(req, { apiKey: "k", generate })).rejects.toMatchObject({ status: 502 });
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("Gemini 429는 429로 전달하고 재시도하지 않는다", async () => {
    const generate = vi.fn().mockRejectedValue(new ApiError({ message: "quota", status: 429 }));
    const err = await analyzeWithGemini(req, { apiKey: "k", generate }).catch((e) => e);
    expect(err).toBeInstanceOf(GeminiError);
    expect(err.status).toBe(429);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("잘못된 API 키는 사진 문제(400)가 아닌 서버 설정 오류(500)로 안내한다", async () => {
    const generate = vi.fn().mockRejectedValue(
      new ApiError({ message: '{"error":{"code":400,"details":[{"reason":"API_KEY_INVALID"}]}}', status: 400 }),
    );
    await expect(analyzeWithGemini(req, { apiKey: "k", generate })).rejects.toMatchObject({ status: 500 });
  });

  it("네트워크 오류는 502", async () => {
    const generate = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(analyzeWithGemini(req, { apiKey: "k", generate })).rejects.toMatchObject({ status: 502 });
  });
});
