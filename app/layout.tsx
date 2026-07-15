import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetAgent | トリミング仕上がりAIシミュレーター",
  description:
    "愛犬の写真からトリミング後の仕上がりをAIがシミュレーション。気に入ったスタイルでそのままEPARKペットライフからサロン予約。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
