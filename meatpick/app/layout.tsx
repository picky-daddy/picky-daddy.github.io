import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeatPick · 로얄팩 골라주는 AI",
  description: "마트 매대의 고기 팩을 한 번에 찍으면 AI가 가장 맛있는 로얄팩을 골라드려요.",
  appleWebApp: { capable: true, title: "MeatPick", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0d0a0a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
