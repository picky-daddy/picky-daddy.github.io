import { analyzeRequestSchema } from "@/lib/schema";

// P1: 요청 형식 검증까지만. Gemini 호출은 P2에서 연결한다.
export async function POST(request: Request) {
  const parsed = analyzeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "BAD_REQUEST", message: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  return Response.json(
    {
      error: "NOT_READY",
      message: "실제 AI 분석은 준비 중이에요. 홈 화면에서 데모 모드를 켜고 체험해 주세요.",
    },
    { status: 503 },
  );
}
