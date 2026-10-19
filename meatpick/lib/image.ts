// 업로드 전 브라우저에서 사진 축소. Vercel 함수 요청 상한(4.5MB)과 Gemini 토큰 비용을 함께 줄인다.

const MAX_EDGE = 1600;
const QUALITY = 0.8;

export type PreparedImage = {
  dataUrl: string; // 미리보기·오버레이용
  base64: string; // API 전송용 (data: 접두사 제외)
  mimeType: "image/jpeg";
};

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // 일부 iOS 버전은 createImageBitmap 옵션을 지원하지 않는다
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const src = await decode(file);
  const w = src.width;
  const h = src.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없어요.");
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  if ("close" in src) src.close();

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return { dataUrl, base64: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: "image/jpeg" };
}
