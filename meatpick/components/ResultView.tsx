"use client";

import { ChevronLeft, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { MEAT, REJECT_MESSAGE } from "@/lib/meat";
import type { MeatReport, MeatType } from "@/lib/schema";
import Disclaimer from "./Disclaimer";
import PackCard from "./PackCard";
import PhotoOverlay from "./PhotoOverlay";
import TrimGuideSheet from "./TrimGuideSheet";

type Props = { image: string; report: MeatReport; meatType: MeatType; onRetake: () => void };

export default function ResultView({ image, report, meatType, onRetake }: Props) {
  const [guideId, setGuideId] = useState<number | null>(null);

  const header = (
    <header className="flex items-center justify-between pt-1">
      <button onClick={onRetake} className="flex items-center gap-1 py-2 pr-3 text-sm font-semibold text-dim">
        <ChevronLeft className="size-5" aria-hidden />
        다시 찍기
      </button>
      <div className="flex items-center gap-2">
        {report.source === "mock" && (
          <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[11px] font-semibold text-gold">데모 결과</span>
        )}
        <span className="text-sm font-bold">
          {MEAT[meatType].emoji} {MEAT[meatType].label}
        </span>
      </div>
    </header>
  );

  if (!report.ok) {
    const msg = REJECT_MESSAGE[report.rejectReason];
    return (
      <div className="flex flex-1 flex-col gap-4">
        {header}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="업로드한 사진" className="w-full rounded-3xl border border-line opacity-60" />
        <div className="rounded-2xl bg-surface p-5 text-center">
          <p className="text-lg font-bold">{msg.title}</p>
          <p className="mt-1 text-sm text-dim">{msg.hint}</p>
        </div>
        <button onClick={onRetake} className="rounded-2xl bg-blood py-4 font-bold text-white active:scale-[0.98]">
          다시 찍기
        </button>
      </div>
    );
  }

  const best = report.packs[0];
  const guidePack = report.packs.find((p) => p.id === guideId) ?? null;
  const scrollToPack = (id: number) =>
    document.getElementById(`pack-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex flex-1 flex-col gap-4">
      {header}

      {report.typeMismatch && report.detectedMeatType && (
        <div className="flex gap-2 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-[13px]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
          <p>
            선택한 부위와 달리 <b>{MEAT[report.detectedMeatType].label}</b>로 보여요. 결과가 정확하지 않을 수 있어요.
          </p>
        </div>
      )}

      <PhotoOverlay image={image} packs={report.packs} onSelect={scrollToPack} />

      <div className="rounded-2xl bg-gradient-to-br from-blood-deep/60 to-surface p-4">
        <p className="text-xs text-dim">팩 {report.totalPacksDetected}개 중 오늘의 1위</p>
        <p className="mt-1 text-lg font-black">
          👑 {best.positionLabel} 팩 <span className="text-gold">{best.totalScore}점</span>
        </p>
        <p className="mt-1 text-sm text-ink/85">{best.oneLiner}</p>
      </div>

      <div className="flex flex-col gap-3">
        {report.packs.map((p, i) => (
          <PackCard key={p.id} pack={p} meatType={meatType} index={i} onOpenGuide={() => setGuideId(p.id)} />
        ))}
      </div>

      <Disclaimer className="pt-2" />

      <TrimGuideSheet pack={guidePack} onClose={() => setGuideId(null)} />
    </div>
  );
}
