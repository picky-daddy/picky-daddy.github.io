import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildSystemInstruction } from "./prompts";
import { buildReport } from "./scoring";
import { aiAnalysisSchema, type AiAnalysis, type AiPack, type AnalyzeRequest, type MeatReport } from "./schema";
import { MEAT } from "./meat";

// 서버 전용. 브라우저 번들에 들어가면 안 된다 (API 키).

export const DEFAULT_MODEL = "gemini-3.6-flash";
const TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 2; // 응답이 스키마를 벗어나면 한 번 더 시도
const MAX_PACKS = 8;

export class GeminiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Gemini responseJsonSchema가 지원하지 않는 키를 걷어낸다:
// 최상위 $schema, 고정 길이 배열에 zod가 붙이는 items:false
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (!node || typeof node !== "object") return node;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "$schema" || (k === "items" && v === false)) continue;
    out[k] = toGeminiSchema(v);
  }
  return out;
}

export const RESPONSE_SCHEMA = toGeminiSchema(z.toJSONSchema(aiAnalysisSchema));

// 모델 출력의 사소한 흔들림 보정: 좌표 순서, id 중복, 팩 수 상한
export function normalize(analysis: AiAnalysis): AiAnalysis {
  const packs = analysis.packs.slice(0, MAX_PACKS).map((p, i): AiPack => {
    const [y1, x1, y2, x2] = p.box2d;
    return {
      ...p,
      id: i + 1,
      box2d: [Math.min(y1, y2), Math.min(x1, x2), Math.max(y1, y2), Math.max(x1, x2)],
    };
  });
  return { ...analysis, packs };
}

export function parseModelText(text: string | undefined): AiAnalysis | null {
  if (!text) return null;
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  const parsed = aiAnalysisSchema.safeParse(json);
  return parsed.success ? normalize(parsed.data) : null;
}

type GenerateFn = GoogleGenAI["models"]["generateContent"];

export async function analyzeWithGemini(
  req: AnalyzeRequest,
  opts: { apiKey: string; model?: string; generate?: GenerateFn },
): Promise<MeatReport> {
  const generate =
    opts.generate ??
    ((params) => {
      const ai = new GoogleGenAI({ apiKey: opts.apiKey, httpOptions: { timeout: TIMEOUT_MS } });
      return ai.models.generateContent(params);
    });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let text: string | undefined;
    try {
      const res = await generate({
        model: opts.model || DEFAULT_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: req.mimeType, data: req.imageBase64 } },
              { text: `선택한 부위: ${MEAT[req.meatType].label}. 사진 속 팩들을 분석해 주세요.` },
            ],
          },
        ],
        config: {
          systemInstruction: buildSystemInstruction(req.meatType),
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
        },
      });
      text = res.text;
    } catch (e) {
      throw toGeminiError(e);
    }

    const analysis = parseModelText(text);
    if (analysis) return buildReport(analysis, req.meatType, "gemini");
    console.warn(`[analyze-meat] 스키마 불일치 응답 (시도 ${attempt}/${MAX_ATTEMPTS})`);
  }
  throw new GeminiError(502, "AI 응답을 해석하지 못했어요. 다시 시도해 주세요.");
}

function toGeminiError(e: unknown): GeminiError {
  if (e instanceof ApiError) {
    console.error(`[analyze-meat] Gemini ApiError ${e.status}: ${e.message}`);
    // 키 문제는 사진 탓이 아니므로 400과 구분해 서버 설정 오류로 안내한다
    if (e.status === 401 || e.status === 403 || e.message.includes("API_KEY_INVALID")) {
      return new GeminiError(500, "AI 분석 설정에 문제가 있어요. 잠시 후 다시 시도해 주세요.");
    }
    if (e.status === 429) return new GeminiError(429, "지금 요청이 많아요. 잠시 후 다시 시도해 주세요.");
    if (e.status === 400) return new GeminiError(400, "사진을 분석할 수 없어요. 다른 사진으로 시도해 주세요.");
  } else {
    console.error("[analyze-meat] Gemini 호출 실패", e);
  }
  return new GeminiError(502, "AI 분석 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
}
