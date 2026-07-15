# PetAgent 引き継ぎ書(AI開発依頼用)

最終更新: 2026-07-15

## 基本情報

| 項目 | 内容 |
|------|------|
| アプリ名称 | PetAgent — トリミング仕上がりAIシミュレーター |
| アプリ概要 | 飼い犬の写真からトリミング後の仕上がりイメージをAIで生成し、EPARKペットライフ(https://petlife.asia/)の予約導線につなげるWebアプリ(MVP) |
| リポジトリ | https://github.com/dat0925/petlife |
| 公開URL | https://petagent.vercel.app |
| デプロイ | Vercel(GitHubリポジトリ連携) |
| 要件定義 | [REQUIREMENTS.md](./REQUIREMENTS.md) を参照 |

## 現在の状態(2026-07-15時点)

- MVP実装済み・Vercelにデプロイ済み。全ページ(`/`, `/embed`, `/epark-mock`)とAPIルートが稼働中。
- **デモモードで動作中**: Vercelに環境変数 `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` が未設定のため、犬種判定・画像生成はモック応答。実AI化するにはVercelのプロジェクト設定で環境変数を追加してRedeployする。
- アップロード画像・生成画像はサーバーに永続化しない方針(個人情報保護)。

## 技術スタック

- Next.js 15 (App Router) / TypeScript / React 19
- CSSは `app/globals.css` に集約(Tailwindは未使用)
- AI判定: Anthropic Claude API `claude-opus-4-8`(vision + structured outputs)
- AI画像生成: Google Gemini `gemini-2.5-flash-image`(画像編集)
- 環境変数: `.env.example` 参照。未設定時は自動でデモモード

## ファイル構成

```
app/
  page.tsx              # トップページ(フル版シミュレーター)
  layout.tsx            # 共通レイアウト・メタデータ
  globals.css           # 全スタイル
  embed/page.tsx        # EPARK埋め込み用コンパクト版(iframe想定)
  epark-mock/page.tsx   # EPARK施設ページ統合デモ(postMessage受信側)
  api/analyze/route.ts  # POST: 画像→犬種/毛質判定+おすすめスタイル(Claude)
  api/generate/route.ts # POST: 画像+スタイル→施術後イメージ生成(Gemini)
components/
  Simulator.tsx         # シミュレーター本体(フル版/埋め込み版共用)
lib/
  styles.ts             # トリミングスタイル定義(teddy/summer/lamb/lion/puppy/top-knot)
```

## API仕様(内部)

### POST /api/analyze

- リクエスト: `{ image: string(base64), mediaType: string }`
- レスポンス: `{ breed, coat, comment, recommendedStyleIds: string[], demo: boolean }`

### POST /api/generate

- リクエスト: 画像(base64)+スタイルID
- レスポンス: 生成画像(base64)+ `demo: boolean`

### 埋め込み連携(/embed → 親ページ)

- 生成結果を `postMessage`(`type: "petagent:attach"`)で親ページへ送信
- 本番展開時は `https://petlife.asia` ⇔ PetAgent配信オリジンで相互オリジン検証を行うこと

## 次フェーズ候補(未実装)

1. Vercel環境変数設定による実AI化(最優先・作業のみ)
2. EPARK予約APIとの直接接続(現在は `/epark-mock` のモック。スタイル画像を予約情報に永続添付)
3. LINE公式アカウント連携(LINE Messaging APIチャットボット)
4. サロン向け管理画面(生成画像をカルテ・指示書として利用)
5. AI受付エージェント(問い合わせ・予約変更の自動応対)
6. 猫対応

## 開発コマンド

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
```

## 注意事項

- 生成画像には「AIによるイメージです」の注記を常時表示すること(クレーム予防、非機能要件)
- スマホファースト(375px〜)を維持すること
- 画像はメモリ内処理のみ。ストレージ保存を追加する場合は個人情報保護の観点を再検討すること
