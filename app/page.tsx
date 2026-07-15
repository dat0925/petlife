import Link from "next/link";
import Simulator from "@/components/Simulator";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          Pet<span>Agent</span> 🐾
        </div>
        <div className="tagline">トリミング仕上がりAIシミュレーター</div>
      </header>

      <Simulator />

      <footer className="footer">
        © 2026 PetAgent — EPARKペットライフ連携プロトタイプ
        <div style={{ marginTop: 6 }}>
          <Link href="/epark-mock" style={{ color: "var(--brand)" }}>
            ▶ サロン掲載ページ埋め込みデモ(次フェーズモック)
          </Link>
        </div>
      </footer>
    </div>
  );
}
