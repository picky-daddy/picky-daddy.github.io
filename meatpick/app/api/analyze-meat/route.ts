import { analyzeWithGemini, GeminiError } from "@/lib/gemini";
import { analyzeRequestSchema } from "@/lib/schema";

// Vercel 함수 요청 상한은 4.5MB. 클라이언트가 1600px로 줄여 보내므로 보통 1MB 미만이다.
const MAX_BODY_BYTES = 4_000_000;

const fail = (status: number, error: string, message: string) => Response.json({ error, message }, { status });

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return fail(413, "TOO_LARGE", "사진 용량이 너무 커요. 다른 사진으로 시도해 주세요.");
  }

  const parsed = analyzeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, "BAD_REQUEST", "요청 형식이 올바르지 않아요.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail(503, "NOT_CONFIGURED", "AI 분석이 아직 설정되지 않았어요. 홈 화면에서 데모 모드로 체험해 주세요.");
  }

  try {
    const report = await analyzeWithGemini(parsed.data, { apiKey, model: process.env.GEMINI_MODEL });
    return Response.json(report);
  } catch (e) {
    if (e instanceof GeminiError) return fail(e.status, "ANALYZE_FAILED", e.message);
    console.error("[analyze-meat] 예기치 못한 오류", e);
    return fail(500, "INTERNAL", "분석 중 문제가 생겼어요. 다시 시도해 주세요.");
  }
}
