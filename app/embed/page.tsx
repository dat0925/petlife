"use client";

import Simulator, { type AttachPayload } from "@/components/Simulator";

// EPARKペットライフ等の施設ページに iframe で埋め込むためのコンパクト版。
// 生成結果は postMessage で親ページへ渡す。
export default function EmbedPage() {
  function handleAttach(payload: AttachPayload) {
    window.parent.postMessage(
      { type: "petagent:attach", payload },
      // 本番では埋め込み先オリジン(https://petlife.asia)を指定する
      "*",
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 24 }}>
      <Simulator embed onAttach={handleAttach} />
    </div>
  );
}
