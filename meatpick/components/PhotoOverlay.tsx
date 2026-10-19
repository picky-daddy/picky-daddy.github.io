"use client";

import { Crown } from "lucide-react";
import { motion } from "motion/react";
import type { ScoredPack } from "@/lib/schema";

// box2d([ymin, xmin, ymax, xmax], 0~1000)를 이미지 위 백분율 위치로 그린다.
export default function PhotoOverlay({
  image,
  packs,
  onSelect,
}: {
  image: string;
  packs: ScoredPack[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="분석한 매대 사진" className="block w-full" />
      {packs.map((p, i) => {
        const [ymin, xmin, ymax, xmax] = p.box2d;
        const best = p.rank === 1;
        return (
          <motion.button
            key={p.id}
            onClick={() => onSelect(p.id)}
            aria-label={`${p.rank}위 ${p.positionLabel} 팩, ${p.totalScore}점`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className={`absolute rounded-xl ${
              best
                ? "border-[3px] border-gold shadow-[0_0_24px_rgba(233,180,76,.55)]"
                : "border-2 border-dashed border-white/60"
            }`}
            style={{
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
            }}
          >
            {best && (
              <motion.span
                className="absolute -top-4 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <Crown className="size-7 fill-gold text-gold drop-shadow" aria-hidden />
              </motion.span>
            )}
            <span
              className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-black ${
                best ? "bg-gold text-bg" : "bg-bg/80 text-ink"
              }`}
            >
              {p.rank}위 · {p.totalScore}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
