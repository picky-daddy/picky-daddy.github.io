"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const STEPS = ["고기 팩 위치 감지 중...", "근육 구조 및 마블링 분석 중...", "살코기·지방 비율 계산 중...", "로얄팩 순위 매기는 중..."];

export default function ScanLoader({ image, onCancel }: { image: string; onCancel: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="relative w-full overflow-hidden rounded-3xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="분석 중인 사진" className="block w-full" />
        <div
          className="absolute inset-0 bg-bg/40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(215,51,43,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(215,51,43,.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <motion.div
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-blood/40 to-blood/0"
          initial={{ top: "-25%" }}
          animate={{ top: ["-25%", "100%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-x-0 bottom-1/2 h-0.5 bg-blood shadow-[0_0_16px_4px] shadow-blood" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-2" aria-live="polite">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold"
        >
          {STEPS[step]}
        </motion.p>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= step ? "bg-blood" : "bg-surface-2"}`} />
          ))}
        </div>
      </div>

      <button onClick={onCancel} className="text-sm text-dim underline underline-offset-4">
        취소
      </button>
    </div>
  );
}
