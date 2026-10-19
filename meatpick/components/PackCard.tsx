"use client";

import { Check, Minus, Scissors, Sparkles, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { MEAT, WARNING_LABEL } from "@/lib/meat";
import type { GradeTier, MeatType, ScoredPack } from "@/lib/schema";
import { LeanFatBar, MetricBar } from "./MetricBar";

const TIER_STYLE: Record<GradeTier, string> = {
  royal: "bg-gold text-bg",
  good: "bg-ok/15 text-ok",
  fair: "bg-surface-2 text-ink",
  poor: "bg-blood/15 text-blood",
};

const LOW_CONFIDENCE = 0.6;

type Props = { pack: ScoredPack; meatType: MeatType; index: number; onOpenGuide: () => void };

export default function PackCard({ pack, meatType, index, onOpenGuide }: Props) {
  const cfg = MEAT[meatType];
  const best = pack.rank === 1;

  return (
    <motion.article
      id={`pack-${pack.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={`scroll-mt-4 rounded-3xl border p-4 ${
        best ? "border-gold/50 bg-gradient-to-b from-gold/10 to-surface" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full text-lg font-black ${
            best ? "bg-gold text-bg" : "bg-surface-2 text-dim"
          }`}
        >
          {pack.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-dim">{pack.positionLabel} 팩</p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${TIER_STYLE[pack.grade.tier]}`}>
            {pack.grade.label}
          </span>
        </div>
        <p className="text-right">
          <span className={`text-3xl font-black tabular-nums ${best ? "text-gold" : ""}`}>{pack.totalScore}</span>
          <span className="text-xs text-dim"> /100</span>
        </p>
      </div>

      {(pack.warnings.length > 0 || pack.confidence < LOW_CONFIDENCE) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pack.warnings.map((w) => (
            <span key={w} className="flex items-center gap-1 rounded-full bg-blood/15 px-2 py-0.5 text-[11px] font-semibold text-blood">
              <TriangleAlert className="size-3" aria-hidden />
              {WARNING_LABEL[w]}
            </span>
          ))}
          {pack.confidence < LOW_CONFIDENCE && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-dim">판단 확신 낮음</span>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <LeanFatBar label={cfg.metricLabels.lean} lean={pack.metrics.leanPercent} ideal={cfg.idealLean} />
        <MetricBar label={cfg.metricLabels.marbling} value={pack.metrics.marblingScore} />
        <MetricBar label={cfg.metricLabels.royal} value={pack.metrics.royalPartScore} />
      </div>

      <div className="mt-4 rounded-2xl bg-bg/60 p-3">
        <p className="flex items-center gap-1 text-[11px] font-bold text-gold">
          <Sparkles className="size-3.5" aria-hidden />
          AI 한 줄 평
        </p>
        <p className="mt-1 text-sm leading-relaxed">{pack.oneLiner}</p>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5 text-[13px] leading-snug">
        {pack.pros.map((t) => (
          <li key={t} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-ok" aria-label="장점" />
            <span>{t}</span>
          </li>
        ))}
        {pack.cons.map((t) => (
          <li key={t} className="flex gap-2 text-ink/80">
            <Minus className="mt-0.5 size-4 shrink-0 text-blood" aria-label="단점" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onOpenGuide}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold active:scale-[0.98] ${
          best ? "bg-gradient-to-b from-blood to-blood-deep text-white shadow-lg shadow-blood/25" : "border border-line text-dim"
        }`}
      >
        <Scissors className="size-4" aria-hidden />
        손질 가이드 보기
      </button>
    </motion.article>
  );
}
