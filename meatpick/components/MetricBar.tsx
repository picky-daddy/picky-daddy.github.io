"use client";

import { motion } from "motion/react";

export function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-dim">{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blood-deep to-blood"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// 살코기(붉은색) : 지방(크림색) 분할 바 + 부위별 이상 비율 표시
export function LeanFatBar({ label, lean, ideal }: { label: string; lean: number; ideal: number }) {
  // 10분율로 반올림한 뒤 나머지를 지방으로 둬야 합이 항상 10이 된다 (85% → 9:1)
  const leanTenths = Math.round(lean / 10);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-dim">{label}</span>
        <span className="font-bold tabular-nums">
          {leanTenths} : {10 - leanTenths}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-fat">
        <motion.div
          className="h-full rounded-l-full bg-lean"
          initial={{ width: 0 }}
          animate={{ width: `${lean}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <span
          className="absolute -top-1 h-4 w-0.5 rounded bg-gold"
          style={{ left: `${ideal}%` }}
          title={`이상 비율 ${ideal / 10}:${(100 - ideal) / 10}`}
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-dim">
        <span className="text-gold">│</span> 이상 비율 {ideal / 10}:{(100 - ideal) / 10}
      </p>
    </div>
  );
}
