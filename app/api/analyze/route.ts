import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { TRIM_STYLES } from "@/lib/styles";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnalyzeResult = {
  breed: string;
  coat: string;
  comment: string;
  recommendedStyleIds: string[];
  demo: boolean;
};

const SCHEMA = {
  type: "object",
  properties: {
    breed: {
      type: "string",
      description: "推定犬種(日本語、例: トイプードル)。雑種の場合は近い犬種を含めて表記",
    },
    coat: {
      type: "string",
      description: "毛質・毛の長さの短い説明(日本語、20文字程度)",
    },
    comment: {
      type: "string",
      description: "飼い主向けのひとことアドバイス(日本語、60文字以内)",
    },
    recommendedStyleIds: {
      type: "array",
      items: {
        type: "string",
        enum: TRIM_STYLES.map((s) => s.id),
      },
      description: "この犬に特におすすめのスタイルID(1〜3個)",
    },
  },
  required: ["breed", "coat", "comment", "recommendedStyleIds"],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  const { image, mediaType } = (await req.json()) as {
    image?: string;
    mediaType?: string;
  };

  if (!image || !mediaType) {
    return NextResponse.json(
      { error: "画像データがありません。もう一度アップロードしてください。" },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const demo: AnalyzeResult = {
      breed: "トイプードル(デモ)",
      coat: "カーリーコート・やや伸びぎみ",
      comment:
        "デモモードで動作中です。APIキーを設定すると実際の写真から判定します。",
      recommendedStyleIds: ["teddy", "lamb", "summer"],
      demo: true,
    };
    return NextResponse.json(demo);
  }

  try {
    const client = new Anthropic();
    const styleList = TRIM_STYLES.map(
      (s) => `- ${s.id}: ${s.name}(${s.description}。主な対象: ${s.breeds})`,
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system:
        "あなたはトリミングサロンの経験豊富なトリマーです。犬の写真から犬種と毛質を判定し、似合うカットスタイルを提案します。",
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: image,
              },
            },
            {
              type: "text",
              text: `この犬の写真を見て、犬種・毛質を判定し、以下のスタイル一覧から特におすすめのものを1〜3個選んでください。\n\n${styleList}`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "この画像は解析できませんでした。別の写真をお試しください。" },
        { status: 422 },
      );
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      throw new Error("empty response");
    }
    const parsed = JSON.parse(text.text);
    return NextResponse.json({ ...parsed, demo: false } satisfies AnalyzeResult);
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: "AI判定でエラーが発生しました。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  }
}
