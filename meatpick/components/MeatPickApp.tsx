"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { analyzeMock, analyzeRemote, AnalyzeError } from "@/lib/analyze";
import { getDemoPref, getDemoPrefServer, setDemoPref, subscribeDemoPref } from "@/lib/demoPref";
import { prepareImage } from "@/lib/image";
import { SAMPLE_IMAGE } from "@/lib/mock";
import type { MeatReport, MeatType } from "@/lib/schema";
import HomeView from "./HomeView";
import ResultView from "./ResultView";
import ScanLoader from "./ScanLoader";

type Phase =
  | { kind: "home" }
  | { kind: "analyzing"; image: string }
  | { kind: "result"; image: string; report: MeatReport }
  | { kind: "error"; message: string };

export default function MeatPickApp() {
  const [meatType, setMeatType] = useState<MeatType>("pork_belly");
  const demo = useSyncExternalStore(subscribeDemoPref, getDemoPref, getDemoPrefServer);
  const [phase, setPhase] = useState<Phase>({ kind: "home" });
  // 진행 중인 분석을 식별해서, 취소 후 늦게 도착한 결과를 버린다
  const runRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    runRef.current++;
    abortRef.current?.abort();
    setPhase({ kind: "home" });
  };

  const run = async (image: string, task: (signal: AbortSignal) => Promise<MeatReport>) => {
    const id = ++runRef.current;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase({ kind: "analyzing", image });
    try {
      const report = await task(ctrl.signal);
      if (id === runRef.current) setPhase({ kind: "result", image, report });
    } catch (e) {
      if (id !== runRef.current) return;
      setPhase({
        kind: "error",
        message: e instanceof AnalyzeError ? e.message : "분석 중 문제가 생겼어요. 다시 시도해 주세요.",
      });
    }
  };

  const startDemo = () => run(SAMPLE_IMAGE[meatType], () => analyzeMock(meatType));

  const startWithFile = async (file: File) => {
    let prepared;
    try {
      prepared = await prepareImage(file);
    } catch {
      setPhase({ kind: "error", message: "사진을 읽을 수 없어요. 다른 사진으로 시도해 주세요." });
      return;
    }
    run(prepared.dataUrl, (signal) =>
      analyzeRemote({ meatType, imageBase64: prepared.base64, mimeType: prepared.mimeType }, signal),
    );
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={phase.kind}
        className="flex flex-1 flex-col"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        {phase.kind === "home" && (
          <HomeView
            meatType={meatType}
            onMeatTypeChange={setMeatType}
            demo={demo}
            onDemoChange={setDemoPref}
            onStartDemo={startDemo}
            onFile={startWithFile}
          />
        )}
        {phase.kind === "analyzing" && <ScanLoader image={phase.image} onCancel={reset} />}
        {phase.kind === "result" && (
          <ResultView image={phase.image} report={phase.report} meatType={meatType} onRetake={reset} />
        )}
        {phase.kind === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-4xl">🥩</p>
            <p className="text-base font-semibold">{phase.message}</p>
            <button
              onClick={reset}
              className="rounded-xl bg-blood px-5 py-3 text-sm font-bold text-white active:scale-[0.98]"
            >
              처음으로
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
