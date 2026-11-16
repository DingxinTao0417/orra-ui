import type { DataGridColumn } from "./data-grid-types";

/* Sample sales ledger for DataGrid (clearly sample data: pass `columns` + `rows`). */

const COPY = {
  en: {
    product: "Product",
    category: "Category",
    region: "Region",
    owner: "Owner",
    units: "Units",
    price: "Unit price",
    revenue: "Revenue",
    margin: "Margin",
    updated: "Updated",
    hardware: "Hardware",
    software: "Software",
    services: "Services",
    north: "North",
    south: "South",
    east: "East",
    west: "West",
    products: [
      "Aurora desk lamp",
      "Cove headphones",
      "Drift keyboard",
      "Ember speaker",
      "Fable notebook",
      "Glint monitor arm",
      "Harbor dock",
      "Iris webcam",
      "Juniper chair",
      "Kite stylus",
      "Lumen light bar",
      "Mosaic license",
      "Nimbus backup",
      "Orbit analytics",
      "Pulse support plan",
      "Quill design suite",
      "Ridge onboarding",
      "Summit training",
    ],
    owners: ["Maya Chen", "Leo Park", "Ana Ruiz", "Sam Wilson", "Priya Shah", "Noah Kim", "Iris Novak", "Omar Haddad"],
  },
  zh: {
    product: "产品",
    category: "品类",
    region: "区域",
    owner: "负责人",
    units: "销量",
    price: "单价",
    revenue: "营收",
    margin: "毛利率",
    updated: "更新日期",
    hardware: "硬件",
    software: "软件",
    services: "服务",
    north: "华北",
    south: "华南",
    east: "华东",
    west: "西部",
    products: [
      "极光台灯",
      "海湾耳机",
      "漂流键盘",
      "余烬音箱",
      "寓言笔记本",
      "微光显示器支架",
      "港湾扩展坞",
      "虹膜摄像头",
      "杜松办公椅",
      "风筝触控笔",
      "流明灯条",
      "马赛克授权",
      "云团备份",
      "轨道分析",
      "脉搏支持计划",
      "羽毛设计套件",
      "山脊入职服务",
      "峰顶培训",
    ],
    owners: ["陈思敏", "朴立恒", "阮安娜", "王思远", "沈晓雯", "金诺亚", "林依然", "韩奥马"],
  },
};

/** Deterministic pseudo-random sequence (same rows on server and client). */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type DataGridSampleRow = {
  id: string;
  product: string;
  category: string;
  region: string;
  owner: string;
  units: number;
  price: number;
  revenue: number;
  margin: number;
  updated: string;
};

export function dataGridSampleColumns(lang: "en" | "zh"): DataGridColumn<DataGridSampleRow>[] {
  const t = COPY[lang];
  const currency = lang === "zh" ? "CNY" : "USD";
  return [
    { key: "product", header: t.product, width: 200 },
    {
      key: "category",
      header: t.category,
      type: "select",
      width: 120,
      options: [
        { id: "hardware", label: t.hardware, tone: "info" },
        { id: "software", label: t.software, tone: "accent" },
        { id: "services", label: t.services, tone: "warning" },
      ],
    },
    {
      key: "region",
      header: t.region,
      type: "select",
      width: 110,
      options: [
        { id: "north", label: t.north },
        { id: "south", label: t.south },
        { id: "east", label: t.east },
        { id: "west", label: t.west },
      ],
    },
    { key: "owner", header: t.owner, width: 130 },
    { key: "units", header: t.units, type: "number", width: 100, summary: "sum" },
    { key: "price", header: t.price, type: "currency", currency, width: 130, summary: "avg" },
    { key: "revenue", header: t.revenue, type: "currency", currency, width: 160, summary: "sum" },
    { key: "margin", header: t.margin, type: "percent", width: 100, summary: "avg" },
    { key: "updated", header: t.updated, type: "date", width: 140, editable: false, summary: "count" },
  ];
}

export function dataGridSampleRows(lang: "en" | "zh", count = 240): DataGridSampleRow[] {
  const t = COPY[lang];
  const rand = seeded(42);
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]!;
  const categories = ["hardware", "software", "services"];
  const regions = ["north", "south", "east", "west"];
  return Array.from({ length: count }, (_, i) => {
    const product = t.products[i % t.products.length]!;
    const category = i % t.products.length < 11 ? "hardware" : i % t.products.length < 14 ? "software" : pick(categories.slice(1));
    const units = Math.round(8 + rand() * 420);
    const price = Math.round((category === "hardware" ? 39 + rand() * 260 : 120 + rand() * 900) * 100) / 100;
    const day = 1 + Math.floor(rand() * 28);
    const month = 9 + Math.floor(rand() * 3);
    return {
      id: `r${i + 1}`,
      product,
      category,
      region: pick(regions),
      owner: pick(t.owners),
      units,
      price,
      revenue: Math.round(units * price),
      margin: Math.round((0.18 + rand() * 0.5) * 1000) / 1000,
      updated: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    };
  });
}
