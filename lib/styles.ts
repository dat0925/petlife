export type TrimStyle = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  breeds: string;
  prompt: string;
};

export const TRIM_STYLES: TrimStyle[] = [
  {
    id: "teddy",
    name: "テディベアカット",
    emoji: "🧸",
    description: "顔を丸く整え、ぬいぐるみのような愛らしい仕上がりに",
    breeds: "トイプードル、ビションフリーゼなど",
    prompt:
      "a teddy bear cut: the face trimmed into a round, plush teddy-bear shape, body fur trimmed to a fluffy medium-short even length",
  },
  {
    id: "summer",
    name: "サマーカット",
    emoji: "🌻",
    description: "全身を短めにカットして涼しく清潔に",
    breeds: "全犬種",
    prompt:
      "a summer cut: the entire body coat clipped short and neat for hot weather, clean tidy outline, face lightly trimmed",
  },
  {
    id: "lamb",
    name: "ラムクリップ",
    emoji: "🐑",
    description: "体は短く、脚はふんわり太めに残す定番スタイル",
    breeds: "プードル系",
    prompt:
      "a lamb clip: body clipped short while the legs are left fluffy and cylindrical like a lamb, rounded face",
  },
  {
    id: "lion",
    name: "ライオンカット",
    emoji: "🦁",
    description: "顔まわりの毛をたてがみ風に残す個性派スタイル",
    breeds: "ポメラニアンなど",
    prompt:
      "a lion cut: body clipped short while a full mane of fur is left around the head, neck and chest like a lion, tail tip left fluffy",
  },
  {
    id: "puppy",
    name: "パピーカット",
    emoji: "🐶",
    description: "全体を均一に短くし、子犬のような自然な印象に",
    breeds: "シーズー、マルチーズなど",
    prompt:
      "a puppy cut: the whole coat trimmed to one even, natural short-to-medium length giving a soft youthful puppy-like look",
  },
  {
    id: "top-knot",
    name: "トップノット",
    emoji: "🎀",
    description: "頭頂部の毛をリボンで結ぶ上品なスタイル",
    breeds: "ヨークシャーテリア、シーズーなど",
    prompt:
      "a top knot style: the hair on top of the head gathered and tied up with a small ribbon bow, face fur neatly trimmed, body coat brushed smooth",
  },
];
