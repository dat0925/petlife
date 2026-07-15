"use client";

import { useRef, useState } from "react";
import { TRIM_STYLES } from "@/lib/styles";

type Phase = "upload" | "analyzing" | "select" | "generating" | "result";

type Analysis = {
  breed: string;
  coat: string;
  comment: string;
  recommendedStyleIds: string[];
  demo: boolean;
};

export type AttachPayload = {
  styleId: string;
  styleName: string;
  beforeImage: string;
  beforeMediaType: string;
  afterImage: string;
  afterMediaType: string;
  demo: boolean;
};

const EPARK_URL = "https://petlife.asia/salon/";
const MAX_SIZE = 10 * 1024 * 1024;

export default function Simulator({
  embed = false,
  onAttach,
}: {
  embed?: boolean;
  onAttach?: (payload: AttachPayload) => void;
}) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [photo, setPhoto] = useState<{ data: string; mediaType: string } | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: string; mediaType: string; demo: boolean } | null>(null);
  const [attached, setAttached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const photoUrl = photo ? `data:${photo.mediaType};base64,${photo.data}` : null;
  const resultUrl = result ? `data:${result.mediaType};base64,${result.data}` : null;

  async function onFileSelected(file: File) {
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPEG / PNG / WebP の画像をアップロードしてください。");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("画像サイズは10MB以下にしてください。");
      return;
    }

    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const data = btoa(binary);
    const uploaded = { data, mediaType: file.type };
    setPhoto(uploaded);
    setPhase("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploaded.data, mediaType: uploaded.mediaType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "判定に失敗しました");
      setAnalysis(json);
      setSelectedStyle(json.recommendedStyleIds[0] ?? null);
      setPhase("select");
    } catch (e) {
      setError(e instanceof Error ? e.message : "判定に失敗しました");
      setPhase("upload");
    }
  }

  async function generate() {
    if (!photo || !selectedStyle) return;
    setError(null);
    setAttached(false);
    setPhase("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photo.data,
          mediaType: photo.mediaType,
          styleId: selectedStyle,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "生成に失敗しました");
      setResult({ data: json.image, mediaType: json.mediaType, demo: json.demo });
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました");
      setPhase("select");
    }
  }

  function reset() {
    setPhase("upload");
    setPhoto(null);
    setAnalysis(null);
    setSelectedStyle(null);
    setResult(null);
    setAttached(false);
    setError(null);
  }

  function attach() {
    if (!photo || !result || !selectedStyle || !onAttach) return;
    onAttach({
      styleId: selectedStyle,
      styleName: TRIM_STYLES.find((s) => s.id === selectedStyle)?.name ?? "",
      beforeImage: photo.data,
      beforeMediaType: photo.mediaType,
      afterImage: result.data,
      afterMediaType: result.mediaType,
      demo: result.demo,
    });
    setAttached(true);
  }

  const styleName = TRIM_STYLES.find((s) => s.id === selectedStyle)?.name ?? "";
  const stepIndex =
    phase === "upload" || phase === "analyzing" ? 0 : phase === "select" ? 1 : 2;

  return (
    <div className={embed ? "sim-embed" : undefined}>
      <div className="steps">
        {["① 写真", "② スタイル選択", "③ 仕上がり確認"].map((label, i) => (
          <div key={label} className={`step${i === stepIndex ? " active" : ""}`}>
            {label}
          </div>
        ))}
      </div>

      {phase === "upload" && (
        <>
          {!embed && (
            <div className="hero">
              <h1>
                愛犬の「カット後」を
                <br />
                AIでシミュレーション
              </h1>
              <p>
                写真を撮ってスタイルを選ぶだけ。仕上がりイメージを確認してから、
                そのままサロンを予約できます。
              </p>
            </div>
          )}
          <div className="card">
            <div
              className="upload-zone"
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
            >
              <div className="icon">📷</div>
              <div className="main">愛犬の写真をアップロード</div>
              <div className="sub">全身が写っている写真がおすすめ(10MBまで)</div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileSelected(f);
                e.target.value = "";
              }}
            />
            {error && <div className="error-box">{error}</div>}
            <div className="notice">
              アップロードされた写真はシミュレーションのみに使用し、サーバーには保存されません。
            </div>
          </div>
        </>
      )}

      {phase === "analyzing" && (
        <div className="card loading">
          <div className="spinner" />
          <div className="msg">AIトリマーが写真を確認中…</div>
          <div className="sub">犬種と毛質を判定しています</div>
        </div>
      )}

      {phase === "select" && analysis && photoUrl && (
        <>
          <div className="card">
            <div className="analysis">
              <img src={photoUrl} alt="アップロードした写真" />
              <div>
                <div className="breed">{analysis.breed}</div>
                <div className="coat">{analysis.coat}</div>
              </div>
            </div>
            <div className="analysis" style={{ marginTop: 8 }}>
              <div className="comment" style={{ width: "100%" }}>
                💬 {analysis.comment}
              </div>
            </div>
            {analysis.demo && (
              <div className="demo-banner">
                🔧 デモモードで動作中(ANTHROPIC_API_KEY 未設定)
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">スタイルを選んでください</div>
            <div className="style-grid">
              {TRIM_STYLES.map((s) => (
                <button
                  key={s.id}
                  className={`style-card${selectedStyle === s.id ? " selected" : ""}`}
                  onClick={() => setSelectedStyle(s.id)}
                >
                  {analysis.recommendedStyleIds.includes(s.id) && (
                    <span className="badge">おすすめ</span>
                  )}
                  <div className="emoji">{s.emoji}</div>
                  <div className="name">{s.name}</div>
                  <div className="desc">{s.description}</div>
                </button>
              ))}
            </div>
            {error && <div className="error-box">{error}</div>}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={generate} disabled={!selectedStyle}>
                このスタイルで仕上がりを見る ✨
              </button>
              <button className="btn btn-ghost" onClick={reset}>
                写真を選び直す
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "generating" && (
        <div className="card loading">
          <div className="spinner" />
          <div className="msg">「{styleName}」に仕上げています…</div>
          <div className="sub">AIが施術後のイメージを生成中(〜30秒)</div>
        </div>
      )}

      {phase === "result" && photoUrl && resultUrl && (
        <>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>
              仕上がりイメージ:{styleName}
            </div>
            <div className="compare">
              <figure>
                <img src={photoUrl} alt="施術前" />
                <figcaption>Before</figcaption>
              </figure>
              <figure>
                <img src={resultUrl} alt="施術後のイメージ" />
                <figcaption>After(AIイメージ)</figcaption>
              </figure>
            </div>
            {result?.demo && (
              <div className="demo-banner">
                🔧 デモモードのため元画像を表示しています(GEMINI_API_KEY を設定すると生成されます)
              </div>
            )}
            <div className="notice">
              ※ AIによる仕上がりイメージです。犬種・毛質・毛玉の状態などにより、実際の仕上がりとは異なる場合があります。
            </div>
          </div>

          <div className="card">
            {onAttach ? (
              <>
                <div className="section-title">この仕上がりで予約に進む</div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "6px 0 14px" }}>
                  仕上がりイメージを予約情報に添付して、サロンのトリマーさんに共有できます。
                </p>
                <button
                  className="btn btn-primary"
                  onClick={attach}
                  disabled={attached}
                >
                  {attached ? "✅ 予約フォームに添付しました" : "📎 この画像を予約に添付する"}
                </button>
              </>
            ) : (
              <>
                <div className="section-title">このスタイル、いいかも?</div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "6px 0 14px" }}>
                  お近くのトリミングサロンを検索して、そのまま予約できます。
                </p>
                <a
                  className="btn btn-primary"
                  href={EPARK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  このスタイルでサロンを予約する
                </a>
                <div className="epark-note">
                  <span>Powered by</span>
                  <strong>EPARKペットライフ</strong>
                </div>
              </>
            )}
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-ghost" onClick={() => setPhase("select")}>
                別のスタイルを試す
              </button>
              <button className="btn btn-ghost" onClick={reset}>
                最初からやり直す
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
