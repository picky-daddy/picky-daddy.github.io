import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeatPick · 로얄팩 골라주는 AI",
    short_name: "MeatPick",
    description: "마트 매대의 고기 팩을 한 번에 찍으면 AI가 로얄팩을 골라드려요.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0a0a",
    theme_color: "#0d0a0a",
    lang: "ko",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
