import { MOCK_ANALYSIS } from "./mock";
import { buildReport } from "./scoring";
import type { AnalyzeRequest, MeatReport, MeatType } from "./schema";

const MOCK_DELAY_MS = 2600;

export class AnalyzeError extends Error {}

export async function analyzeMock(meatType: MeatType): Promise<MeatReport> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return buildReport(MOCK_ANALYSIS[meatType], meatType, "mock");
}

export async function analyzeRemote(req: AnalyzeRequest, signal?: AbortSignal): Promise<MeatReport> {
  let res: Response;
  try {
    res = await fetch("/api/analyze-meat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new AnalyzeError("네트워크 연결을 확인해 주세요.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AnalyzeError(body?.message ?? "분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
  }
  return body as MeatReport;
}
