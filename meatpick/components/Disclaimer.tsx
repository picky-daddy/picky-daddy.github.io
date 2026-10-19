export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] leading-relaxed text-dim/80 ${className}`}>
      AI 판단은 사진을 바탕으로 한 참고용이에요. 신선도·위생·유통기한 판정이 아니며, 사진은 저장하지 않아요.
    </p>
  );
}
