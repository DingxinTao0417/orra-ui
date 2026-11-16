import type { ModelOption } from "@orra-ui/react";

export type Aspect = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
export type ImageStyle = "none" | "film" | "illustration" | "portrait" | "surreal" | "product";

export const ASPECTS: Aspect[] = ["1:1", "3:4", "4:3", "16:9", "9:16"];

export const STYLES: { id: ImageStyle; label: string }[] = [
  { id: "none", label: "不限" },
  { id: "film", label: "胶片" },
  { id: "illustration", label: "插画" },
  { id: "portrait", label: "人像" },
  { id: "surreal", label: "超现实" },
  { id: "product", label: "产品" },
];

export const styleLabel = (s: ImageStyle) => STYLES.find((x) => x.id === s)?.label ?? "不限";

export const IMAGE_MODELS: ModelOption[] = [
  { id: "prism-3", name: "Prism 3", provider: "Prism", description: "照片级写实，光影与材质细节丰富", capabilities: ["vision"], isNew: true },
  { id: "prism-3-turbo", name: "Prism 3 Turbo", provider: "Prism", description: "4 秒出图，适合快速试方向", capabilities: ["fast"] },
  { id: "inkwell-2", name: "Inkwell 2", provider: "Inkwell", description: "插画、平面与手绘风格", capabilities: ["vision"] },
  { id: "lumen-canvas", name: "Lumen Canvas", provider: "Lumen", description: "擅长海报排版与画面中的文字", capabilities: ["vision", "long-context"] },
];

/** Output size for an aspect ratio (before upscaling). */
export function pixelSize(aspect: Aspect, scale = 1) {
  const map: Record<Aspect, [number, number]> = {
    "1:1": [2048, 2048],
    "3:4": [1536, 2048],
    "4:3": [2048, 1536],
    "16:9": [2048, 1152],
    "9:16": [1152, 2048],
  };
  const [w, h] = map[aspect];
  return `${w * scale} × ${h * scale}`;
}

export const aspectCss = (a: Aspect) => a.replace(":", " / ");

/** Artwork shipped in /public/ai-chat/gallery, with the prompt that "made" it. */
export const ART: Record<string, { prompt: string; style: ImageStyle }> = {
  "beach-kid": { prompt: "海边奔跑的小孩，逆光，胶片颗粒，夏日午后", style: "film" },
  "biker-rest": { prompt: "公路边休息的骑手，夕阳侧光，安静的构图", style: "film" },
  "cat-with-beer": { prompt: "举着啤酒杯的橘猫，贴纸风格，粗描边", style: "illustration" },
  "cloud-crown": { prompt: "云朵组成的王冠漂浮在湖面上，清晨薄雾", style: "surreal" },
  "girls-and-blooms": { prompt: "花丛中的两个女孩，柔焦，粉彩色调", style: "illustration" },
  "goldfish-living-room": { prompt: "客厅里游过的巨大金鱼，午后阳光，梦境感", style: "surreal" },
  "green-ape": { prompt: "绿色毛发的猩猩肖像，杂志封面质感", style: "portrait" },
  "hanok-bookshop": { prompt: "雨夜的韩屋书店，暖光从木窗透出，街面倒影", style: "film" },
  "helmet-portraits": { prompt: "戴复古头盔的人物群像，棚拍，硬光", style: "portrait" },
  hoopoes: { prompt: "两只戴胜鸟停在开花的枝头，水彩", style: "illustration" },
  "linen-campaign": { prompt: "亚麻衬衫的服装广告大片，自然光，留白", style: "product" },
  "massive-box": { prompt: "沙漠中央一只巨大的纸箱，极简构图", style: "surreal" },
  "nairobi-vibes": { prompt: "内罗毕街头的色彩，街拍，高饱和", style: "film" },
  "perfume-still-life": { prompt: "香水瓶静物，丝绸与晨光，柔和阴影", style: "product" },
  "racing-suit": { prompt: "穿复古赛车服的女孩，90 年代杂志感", style: "portrait" },
  "reader-pink": { prompt: "粉色房间里看书的人，平面插画", style: "illustration" },
  "ronin-red": { prompt: "红色天空下的浪人剪影，版画质感", style: "illustration" },
  "underwater-highway": { prompt: "海底的高速公路，鱼群穿过车流", style: "surreal" },
  "yellow-cabs": { prompt: "雨中的黄色出租车车队，长曝光", style: "film" },
};

export const artUrl = (art: string) => `/ai-chat/gallery/${art}.svg`;

export interface GalleryImage {
  id: string;
  art: string;
  prompt: string;
  style: ImageStyle;
  aspect: Aspect;
  favorite: boolean;
  /** Static label, e.g. "昨天"; new images say "刚刚". */
  when: string;
  upscaled?: boolean;
}

/** Older generations that only live in the gallery. */
export const OLDER_GALLERY: GalleryImage[] = [
  { id: "o1", art: "perfume-still-life", ...ART["perfume-still-life"]!, aspect: "3:4", favorite: true, when: "昨天" },
  { id: "o2", art: "green-ape", ...ART["green-ape"]!, aspect: "3:4", favorite: false, when: "昨天" },
  { id: "o3", art: "linen-campaign", ...ART["linen-campaign"]!, aspect: "3:4", favorite: false, when: "昨天" },
  { id: "o4", art: "massive-box", ...ART["massive-box"]!, aspect: "1:1", favorite: true, when: "11 月 12 日" },
  { id: "o5", art: "racing-suit", ...ART["racing-suit"]!, aspect: "3:4", favorite: false, when: "11 月 12 日" },
  { id: "o6", art: "goldfish-living-room", ...ART["goldfish-living-room"]!, aspect: "4:3", favorite: false, when: "11 月 10 日" },
  { id: "o7", art: "helmet-portraits", ...ART["helmet-portraits"]!, aspect: "3:4", favorite: false, when: "11 月 10 日" },
];

/** Art used for each scripted generation, in order. */
export const ART_SETS = {
  beach: ["beach-kid", "nairobi-vibes", "biker-rest", "girls-and-blooms"],
  cat: ["cat-with-beer", "hoopoes", "reader-pink", "ronin-red"],
  hanok: ["hanok-bookshop", "yellow-cabs", "underwater-highway", "cloud-crown"],
};

/** Pool for variations and free-form prompts. */
export const ART_POOL = Object.keys(ART);

export const DEFAULT_PROMPT = "雨夜霓虹下的韩屋书店，胶片质感，暖色灯光从木窗透出，石板路上有倒影";

export const WELCOME_IDEAS = [
  { id: "poster", title: "活动海报", description: "秋日市集主视觉，留出标题位置", prompt: "秋日市集主视觉海报，暖橙色调，手绘感，顶部留出标题空间" },
  { id: "product", title: "产品静物", description: "柔光棚拍，适合详情页", prompt: "陶瓷咖啡杯产品静物，柔和侧光，米色背景，浅景深" },
  { id: "avatar", title: "头像插画", description: "扁平风格，统一的团队头像", prompt: "扁平风格的人物头像插画，圆形构图，低饱和配色" },
  { id: "scene", title: "超现实场景", description: "梦境般的画面与比例", prompt: "客厅里游过的巨大金鱼，午后阳光，梦境感" },
];
