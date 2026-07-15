"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AttachPayload } from "@/components/Simulator";

// 次フェーズモック: EPARKペットライフの施設情報掲載画面に PetAgent を埋め込み、
// 生成した仕上がりイメージを予約情報に添付するフローのデモ。
// ※ 画面はモックであり、実際の予約は行われません。

const MENUS = [
  { id: "cut-shampoo", name: "カットコース(シャンプー込み)", price: "¥6,600〜" },
  { id: "shampoo", name: "シャンプーコース", price: "¥4,400〜" },
  { id: "cut-spa", name: "カット + 炭酸泉スパ", price: "¥8,250〜" },
];

const TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00"];

export default function EparkMockPage() {
  const [attachment, setAttachment] = useState<AttachPayload | null>(null);
  const [menu, setMenu] = useState(MENUS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // 本番では e.origin をシミュレーター配信オリジンで検証する
      if (e.data?.type === "petagent:attach" && e.data.payload) {
        setAttachment(e.data.payload as AttachPayload);
        document
          .getElementById("booking-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const afterUrl = attachment
    ? `data:${attachment.afterMediaType};base64,${attachment.afterImage}`
    : null;
  const beforeUrl = attachment
    ? `data:${attachment.beforeMediaType};base64,${attachment.beforeImage}`
    : null;
  const menuName = MENUS.find((m) => m.id === menu)?.name ?? "";

  if (confirmed) {
    return (
      <div className="ep-page">
        <MockHeader />
        <div className="ep-body">
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <h2 style={{ margin: "8px 0" }}>予約リクエストを送信しました</h2>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              (モック画面です。実際の予約は行われていません)
            </p>
            <div className="ep-summary">
              <div className="ep-summary-row">
                <span>サロン</span>
                <strong>ドッグサロン ハピネス 新宿店</strong>
              </div>
              <div className="ep-summary-row">
                <span>メニュー</span>
                <strong>{menuName}</strong>
              </div>
              <div className="ep-summary-row">
                <span>日時</span>
                <strong>
                  {date || "(日付未指定)"} {time}
                </strong>
              </div>
              {attachment && (
                <div className="ep-summary-row">
                  <span>希望スタイル</span>
                  <strong>{attachment.styleName}(イメージ添付あり)</strong>
                </div>
              )}
            </div>
            {afterUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={afterUrl}
                  alt="添付された仕上がりイメージ"
                  style={{ width: 160, borderRadius: 12 }}
                />
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
                  この画像がサロンのトリマーに共有されます
                </div>
              </div>
            )}
            <button
              className="btn btn-ghost"
              style={{ marginTop: 20 }}
              onClick={() => setConfirmed(false)}
            >
              施設ページに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <MockHeader />

      <div className="ep-body">
        {/* 施設情報 */}
        <div className="ep-salon-card">
          <div className="ep-photo-strip">
            <div className="ep-photo">🏠</div>
            <div className="ep-photo">✂️</div>
            <div className="ep-photo">🛁</div>
            <div className="ep-photo">🐩</div>
          </div>
          <div className="ep-salon-head">
            <h1>ドッグサロン ハピネス 新宿店</h1>
            <div className="ep-rating">
              ★★★★☆ <span>4.3(126件)</span>
            </div>
            <div className="ep-tags">
              <span>送迎あり</span>
              <span>当日OK</span>
              <span>小型犬〜大型犬</span>
              <span>炭酸泉</span>
            </div>
            <div className="ep-address">📍 東京都新宿区西新宿1-2-3 ○○ビル2F(新宿駅 徒歩5分)</div>
          </div>
        </div>

        {/* メニュー */}
        <div className="card">
          <div className="section-title">メニュー・料金</div>
          <table className="ep-menu-table">
            <tbody>
              {MENUS.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td className="ep-price">{m.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 埋め込みシミュレーター */}
        <div className="card ep-sim-card">
          <div className="ep-sim-head">
            <div className="section-title">✨ AIで仕上がりをシミュレーション</div>
            <p>
              愛犬の写真からカット後のイメージを生成して、そのまま予約に添付できます。
              <br />
              <span style={{ color: "var(--brand)", fontWeight: 700 }}>
                Powered by PetAgent
              </span>
            </p>
          </div>
          <iframe
            src="/embed"
            title="PetAgent トリミングシミュレーター"
            className="ep-iframe"
          />
        </div>

        {/* 予約フォーム */}
        <div className="card" id="booking-panel">
          <div className="section-title">ネット予約</div>

          {attachment ? (
            <div className="ep-attach">
              <div className="ep-attach-head">📎 仕上がりイメージが添付されています</div>
              <div className="ep-attach-body">
                {beforeUrl && <img src={beforeUrl} alt="施術前" />}
                <span className="ep-arrow">→</span>
                {afterUrl && <img src={afterUrl} alt="仕上がりイメージ" />}
                <div className="ep-attach-info">
                  <strong>{attachment.styleName}</strong>
                  <span>トリマーに画像で希望スタイルが伝わります</span>
                  <button className="ep-remove" onClick={() => setAttachment(null)}>
                    添付を削除
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 0, marginBottom: 12 }}>
              上のシミュレーターで生成した仕上がりイメージを予約に添付できます(任意)。
            </div>
          )}

          <label className="ep-label">
            メニュー
            <select value={menu} onChange={(e) => setMenu(e.target.value)}>
              {MENUS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.price}
                </option>
              ))}
            </select>
          </label>

          <label className="ep-label">
            希望日
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="ep-label">
            希望時間
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setConfirmed(true)}>
            この内容で予約リクエスト(モック)
          </button>
          <div className="notice">
            ※ これは次フェーズ検討用のモック画面です。実際の予約は行われません。
          </div>
        </div>

        <footer className="footer">
          <Link href="/" style={{ color: "var(--brand)" }}>
            ← PetAgent 単体アプリに戻る
          </Link>
        </footer>
      </div>
    </div>
  );
}

function MockHeader() {
  return (
    <header className="ep-header">
      <div className="ep-header-inner">
        <div className="ep-brand">
          EPARK<span>ペットライフ</span>
        </div>
        <div className="ep-mock-badge">埋め込みデモ(モック)</div>
      </div>
    </header>
  );
}
