"use client";

import { Scissors, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { ScoredPack } from "@/lib/schema";

export default function TrimGuideSheet({ pack, onClose }: { pack: ScoredPack | null; onClose: () => void }) {
  useEffect(() => {
    if (!pack) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pack, onClose]);

  return (
    <AnimatePresence>
      {pack && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trim-title"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-line bg-surface px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-2" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-dim">
                  {pack.rank}위 · {pack.positionLabel} 팩
                </p>
                <h2 id="trim-title" className="mt-1 flex items-center gap-2 text-lg font-black">
                  <Scissors className="size-5 text-blood" aria-hidden />
                  집에서 이렇게 손질해 드세요
                </h2>
              </div>
              <button onClick={onClose} aria-label="닫기" className="rounded-full bg-surface-2 p-2">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-bg/60 p-4 text-[15px] leading-relaxed">{pack.trimmingGuide}</p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-2xl bg-gradient-to-b from-blood to-blood-deep py-3.5 font-bold text-white"
            >
              확인
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
