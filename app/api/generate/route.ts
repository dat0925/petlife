import { NextRequest, NextResponse } from "next/server";
import { TRIM_STYLES } from "@/lib/styles";

export const runtime = "nodejs";
export const maxDuration = 120;

const GEMINI_MODEL = "gemini-2.5-flash-image";

export async function POST(req: NextRequest) {
  const { image, mediaType, styleId } = (await req.json()) as {
    image?: string;
    mediaType?: string;
    styleId?: string;
  };

  const style = TRIM_STYLES.find((s) => s.id === styleId);
  if (!image || !mediaType || !style) {
    return NextResponse.json(
      { error: "リクエストが不正です。最初からやり直してください。" },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    // デモモード: 元画像をそのまま返し、UI側でデモ表示する
    return NextResponse.json({
      image,
      mediaType,
      demo: true,
    });
  }

  const prompt =
    `Edit this photo of a dog to show the SAME dog after professional grooming with ${style.prompt}. ` +
    `Keep the same dog (same breed, same fur color, same face, same eyes, same pose), the same background, ` +
    `the same lighting and the same camera angle. Only change the fur styling as described. ` +
    `The result must look like a realistic photograph taken at the same moment, not an illustration.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mediaType, data: image } },
                { text: prompt },
              ],
            },
          ],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("gemini error:", res.status, body.slice(0, 500));
      return NextResponse.json(
        { error: "画像生成でエラーが発生しました。時間をおいて再度お試しください。" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const parts: Array<{ inlineData?: { mimeType: string; data: string } }> =
      data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      console.error("gemini: no image in response", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "画像を生成できませんでした。別の写真かスタイルでお試しください。" },
        { status: 422 },
      );
    }

    return NextResponse.json({
      image: imagePart.inlineData.data,
      mediaType: imagePart.inlineData.mimeType,
      demo: false,
    });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      { error: "画像生成でエラーが発生しました。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  }
}
