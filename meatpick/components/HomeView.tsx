"use client";

import { Camera, FlaskConical, ImagePlus, Info, ScanLine } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { MEAT } from "@/lib/meat";
import { SAMPLE_IMAGE } from "@/lib/mock";
import { MEAT_TYPES, type MeatType } from "@/lib/schema";
import Disclaimer from "./Disclaimer";

type Props = {
  meatType: MeatType;
  onMeatTypeChange: (t: MeatType) => void;
  demo: boolean;
  onDemoChange: (on: boolean) => void;
  onStartDemo: () => void;
  onFile: (file: File) => void;
};

export default function HomeView({ meatType, onMeatTypeChange, demo, onDemoChange, onStartDemo, onFile }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 사진을 다시 골라도 change가 일어나도록
    if (file) onFile(file);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="pt-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold">PREMIUM BUTCHER AI</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Meat<span className="text-blood">Pick</span>
        </h1>
        <p className="mt-1 text-sm text-dim">매대 위 로얄팩, AI가 골라드려요.</p>
      </header>

      <nav role="tablist" aria-label="부위 선택" className="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
        {MEAT_TYPES.map((t) => {
          const active = t === meatType;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => onMeatTypeChange(t)}
              className={`relative rounded-xl py-3 text-sm font-bold transition-colors ${active ? "text-white" : "text-dim"}`}
            >
              {active && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-blood to-blood-deep shadow-lg shadow-blood/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">
                {MEAT[t].emoji} {MEAT[t].label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex gap-2.5 rounded-2xl border border-gold/25 bg-gold/10 p-3.5 text-[13px] leading-relaxed text-ink/90">
        <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        <p>
          비닐 빛 반사가 적게 <b>각도를 살짝 기울여</b> <b>2~4개의 팩</b>을 한 번에 찍어주세요.
        </p>
      </div>

      {demo ? (
        <section className="overflow-hidden rounded-3xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SAMPLE_IMAGE[meatType]} alt={`${MEAT[meatType].label} 샘플 매대 사진`} className="aspect-[4/3] w-full object-cover" />
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm text-dim">
              샘플 매대 사진 · <span className="text-ink">{MEAT[meatType].label} 3팩</span>
            </p>
            <button
              onClick={onStartDemo}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blood to-blood-deep py-4 text-base font-bold text-white shadow-lg shadow-blood/30 active:scale-[0.98]"
            >
              <ScanLine className="size-5" aria-hidden />
              샘플로 로얄팩 찾기
            </button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-line bg-surface/60 px-4 py-8">
          <div className="grid size-16 place-items-center rounded-full bg-blood/15">
            <Camera className="size-8 text-blood" aria-hidden />
          </div>
          <p className="text-center text-sm text-dim">
            {MEAT[meatType].label} 팩들이 한 화면에 모두 들어오게 찍어주세요
          </p>
          <div className="grid w-full grid-cols-2 gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blood to-blood-deep py-4 font-bold text-white shadow-lg shadow-blood/30 active:scale-[0.98]"
            >
              <Camera className="size-5" aria-hidden />
              촬영하기
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-4 font-bold active:scale-[0.98]"
            >
              <ImagePlus className="size-5" aria-hidden />
              갤러리
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </section>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4">
        <FlaskConical className="size-5 shrink-0 text-gold" aria-hidden />
        <span className="flex-1">
          <span className="block text-sm font-semibold">샘플 이미지로 데모 테스트하기</span>
          <span className="block text-xs text-dim">API 키 없이 Mock Data로 화면을 체험해요</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={demo}
          onChange={(e) => onDemoChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-7 w-12 shrink-0 rounded-full bg-surface-2 ring-1 ring-line transition-colors peer-checked:bg-blood peer-focus-visible:ring-2 peer-focus-visible:ring-gold after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      <Disclaimer className="mt-auto" />
    </div>
  );
}
