"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Selection } from "react-aria-components";
import {
  RiBrushLine,
  RiDownload2Line,
  RiEqualizer2Line,
  RiImageAddLine,
  RiImageCircleAiLine,
  RiMagicLine,
  RiPaletteLine,
  RiRefreshLine,
  RiShuffleLine,
  RiStarFill,
  RiStarLine,
  RiUserSmileLine,
  RiZoomInLine,
} from "@remixicon/react";
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  ComposerAttachments,
  ComposerPanel,
  IconButton,
  Modal,
  ModelPicker,
  Popover,
  Progress,
  SearchField,
  SegmentedControl,
  Slider,
  Switch,
  Tooltip,
  toast,
  type ComposerAttachmentItem,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { ChatComposerDock, ChatMessage, ChatMessageActions, ChatNotice, ChatShell, ChatThread, ChatWelcome, clockLabel } from "../shared/chat-shell";
import {
  ART,
  ART_POOL,
  ART_SETS,
  ASPECTS,
  DEFAULT_PROMPT,
  IMAGE_MODELS,
  OLDER_GALLERY,
  STYLES,
  WELCOME_IDEAS,
  artUrl,
  aspectCss,
  pixelSize,
  styleLabel,
  type Aspect,
  type GalleryImage,
  type ImageStyle,
} from "./image-data";

/* ----------------------------------------------------------------- state */

interface GenSettings {
  aspect: Aspect;
  style: ImageStyle;
  count: number;
}

interface Generation {
  id: string;
  kind: "prompt" | "variation" | "upscale";
  prompt: string;
  /** Variation / upscale: the source image and its number in its grid. */
  source?: { art: string; label: string };
  settings: GenSettings;
  model: string;
  time: string;
  status: "running" | "done" | "stopped";
  progress: number;
  arts: string[];
  seed: number;
  startedAt: number;
  duration?: number;
  published?: boolean;
}

const imageId = (gen: Generation, i: number) => `${gen.id}-${i}`;

function historyGen(id: string, prompt: string, arts: string[], settings: GenSettings, time: string, seed: number, extra: Partial<Generation> = {}): Generation {
  return { id, kind: "prompt", prompt, settings, model: "prism-3", time, status: "done", progress: 100, arts, seed, startedAt: 0, duration: 7.4, published: true, ...extra };
}

const HISTORY: Generation[] = [
  historyGen("g1", "海边奔跑的小孩，逆光，胶片颗粒，夏日午后，远处有冲浪的人", ART_SETS.beach, { aspect: "3:4", style: "film", count: 4 }, "09:12", 2847193),
  historyGen("g2", "举着啤酒杯的橘猫，贴纸风格，粗描边，适合做表情包", ART_SETS.cat, { aspect: "1:1", style: "illustration", count: 4 }, "09:20", 913_502, {
    model: "inkwell-2",
    duration: 5.8,
  }),
  historyGen("g3", "举着啤酒杯的橘猫，贴纸风格，粗描边，适合做表情包", ["cat-with-beer"], { aspect: "1:1", style: "illustration", count: 1 }, "09:21", 913_502, {
    kind: "upscale",
    model: "inkwell-2",
    source: { art: "cat-with-beer", label: "图 1" },
    duration: 3.1,
  }),
];

function galleryFrom(gen: Generation, when: string): GalleryImage[] {
  return gen.arts.map((art, i) => ({
    id: imageId(gen, i),
    art,
    prompt: gen.prompt,
    style: gen.settings.style === "none" ? (ART[art]?.style ?? "none") : gen.settings.style,
    aspect: gen.settings.aspect,
    favorite: false,
    when,
    upscaled: gen.kind === "upscale",
  }));
}

const INITIAL_GALLERY: GalleryImage[] = [
  ...[...HISTORY].reverse().flatMap((g) => galleryFrom(g, "今天")).map((img) => (img.id === "g1-0" ? { ...img, favorite: true } : img)),
  ...OLDER_GALLERY,
];

function download(art: string, name: string) {
  const a = document.createElement("a");
  a.href = artUrl(art);
  a.download = `${name}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* -------------------------------------------------------------- template */

export function AiImageGenerationTemplate() {
  const [mode, setMode] = useState<"history" | "welcome">("history");
  const [gens, setGens] = useState<Generation[]>(HISTORY);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [text, setText] = useState(DEFAULT_PROMPT);
  const [refs, setRefs] = useState<ComposerAttachmentItem[]>([]);
  const [settings, setSettings] = useState<GenSettings>({ aspect: "3:4", style: "film", count: 4 });
  const [creativity, setCreativity] = useState(60);
  const [hires, setHires] = useState(true);
  const [model, setModel] = useState("prism-3");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const pool = useRef(0);

  const running = gens.some((g) => g.status === "running");

  // Progress of every running generation, on the client only.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setGens((list) =>
        list.map((g) => {
          if (g.status !== "running") return g;
          const step = g.kind === "upscale" ? 6 + Math.random() * 6 : 2.5 + Math.random() * 4.5;
          const progress = Math.min(100, g.progress + step);
          return progress >= 100 ? { ...g, progress: 100, status: "done", duration: Math.round((Date.now() - g.startedAt) / 100) / 10 } : { ...g, progress };
        }),
      );
    }, 220);
    return () => window.clearInterval(id);
  }, [running]);

  // Finished generations land at the top of the gallery.
  useEffect(() => {
    const fresh = gens.filter((g) => g.status === "done" && !g.published);
    if (!fresh.length) return;
    setGallery((list) => [...fresh.reverse().flatMap((g) => galleryFrom(g, "今天")), ...list]);
    setGens((list) => list.map((g) => (fresh.some((f) => f.id === g.id) ? { ...g, published: true } : g)));
  }, [gens]);

  const pickArts = (n: number, exclude?: string) => {
    const out: string[] = [];
    while (out.length < n) {
      const art = ART_POOL[pool.current++ % ART_POOL.length]!;
      if (art !== exclude && !out.includes(art)) out.push(art);
    }
    return out;
  };

  const start = (gen: Omit<Generation, "id" | "time" | "status" | "progress" | "seed" | "startedAt" | "model">) => {
    setGens((list) => [
      ...list,
      { ...gen, id: `gen-${Date.now()}`, model, time: clockLabel(), status: "running", progress: 0, seed: Math.floor(100_000 + Math.random() * 8_900_000), startedAt: Date.now() },
    ]);
  };

  const generate = (prompt: string) => {
    const arts = /韩屋|书店/.test(prompt) ? ART_SETS.hanok.slice(0, settings.count) : pickArts(settings.count);
    start({ kind: "prompt", prompt, settings, arts });
    setText("");
    setRefs([]);
  };

  const vary = (img: { art: string; prompt: string; aspect: Aspect; style: ImageStyle }, label: string) => {
    start({ kind: "variation", prompt: img.prompt, source: { art: img.art, label }, settings: { aspect: img.aspect, style: img.style, count: 4 }, arts: pickArts(4, img.art) });
    setLightbox(null);
  };

  const upscale = (img: { art: string; prompt: string; aspect: Aspect; style: ImageStyle }, label: string) => {
    start({ kind: "upscale", prompt: img.prompt, source: { art: img.art, label }, settings: { aspect: img.aspect, style: img.style, count: 1 }, arts: [img.art] });
    setLightbox(null);
  };

  const setReference = (img: GalleryImage) => {
    setRefs([{ id: `ref-${img.id}`, name: `参考图-${img.art}.svg`, size: 1_120, type: "image/svg+xml", previewUrl: artUrl(img.art) }]);
    setLightbox(null);
    toast.success("已设为参考图", { description: "下一次生成会参考它的构图与配色" });
  };

  const toggleFavorite = (id: string) => setGallery((list) => list.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)));

  const stop = () => setGens((list) => list.map((g) => (g.status === "running" ? { ...g, status: "stopped" } : g)));

  const live = gens.filter((g) => g.status === "running");
  const livePct = live.length ? Math.round(live.reduce((s, g) => s + g.progress, 0) / live.length) : 0;
  const favorites = new Set(gallery.filter((g) => g.favorite).map((g) => g.id));
  const lightboxImage = gallery.find((g) => g.id === lightbox) ?? null;

  const imageActions = {
    open: (id: string) => setLightbox(id),
    favorite: toggleFavorite,
    vary,
    upscale,
  };

  return (
    <ChatShell
      active="hanok-night"
      title={mode === "welcome" ? "新的创作" : "雨夜韩屋书店概念图"}
      titleMeta={
        mode === "history" ? (
          <Badge variant="outline" size="sm" icon={<RiImageCircleAiLine />}>
            图像
          </Badge>
        ) : null
      }
      model={<ModelPicker models={IMAGE_MODELS} value={model} onChange={setModel} control="none" size="sm" placement="bottom end" />}
      onNewChat={() => {
        setMode("welcome");
        setGens([]);
        setText("");
        setRefs([]);
      }}
      panel={{
        title: "作品库",
        description: `${gallery.length} 张 · 收藏 ${favorites.size} 张`,
        toggleLabel: "作品库",
        width: 400,
        minWidth: 320,
        maxWidth: 680,
        content: <GalleryPanel images={gallery} onOpen={setLightbox} onFavorite={toggleFavorite} />,
      }}
    >
      <ChatThread>
        {mode === "welcome" && gens.length === 0 ? (
          <ChatWelcome
            title="想画点什么？"
            description="描述画面、氛围和用途，我会一次给你几种方向，再挑一张继续打磨。"
            avatar={<span className="grid size-[72px] place-items-center rounded-full bg-accent-50 text-fg-accent"><RiImageCircleAiLine className="size-9" /></span>}
            suggestions={WELCOME_IDEAS.map((idea, i) => ({
              id: idea.id,
              title: idea.title,
              description: idea.description,
              icon: [<RiPaletteLine key="a" />, <RiMagicLine key="b" />, <RiUserSmileLine key="c" />, <RiBrushLine key="d" />][i]!,
            }))}
            onPick={(s) => generate(WELCOME_IDEAS.find((x) => x.id === s.id)!.prompt)}
          />
        ) : null}
        {gens.map((gen) => (
          <GenerationTurn key={gen.id} gen={gen} favorites={favorites} actions={imageActions} onRetry={() => start({ kind: gen.kind, prompt: gen.prompt, source: gen.source, settings: gen.settings, arts: gen.kind === "upscale" ? gen.arts : pickArts(gen.arts.length) })} />
        ))}
      </ChatThread>

      <ChatComposerDock hint="生成的图片默认仅自己可见，可在作品库中分享或下载。">
        <ComposerPanel
          value={text}
          onChange={setText}
          onSubmit={({ text: t }) => generate(t || "延续参考图的构图与配色")}
          attachments={refs}
          onRemoveAttachment={(id) => setRefs((list) => list.filter((r) => r.id !== id))}
          onFilesSelected={(files) =>
            setRefs(
              files.slice(0, 1).map((f) => ({
                id: `up-${Date.now()}`,
                name: f.name,
                size: f.size,
                type: f.type,
                previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
              })),
            )
          }
          addActions={[{ id: "gallery", label: "从作品库选择参考图", icon: <RiImageAddLine />, description: "沿用构图、配色或人物" }]}
          onAddAction={() => {
            const img = gallery.find((g) => g.favorite) ?? gallery[0];
            if (img) setReference(img);
          }}
          modes={[]}
          modelPicker={
            <>
              <SettingsPopover
                settings={settings}
                onChange={setSettings}
                creativity={creativity}
                onCreativity={setCreativity}
                hires={hires}
                onHires={setHires}
              />
              <ModelPicker models={IMAGE_MODELS} value={model} onChange={setModel} control="none" variant="ghost" size="sm" placement="top start" className="max-sm:hidden" />
            </>
          }
          loading={running}
          loadingLabel={`正在生成 · ${livePct}%`}
          onStop={stop}
          placeholder="描述你想要的画面：主体、场景、光线、风格…"
          minRows={2}
        />
      </ChatComposerDock>

      <Lightbox image={lightboxImage} onClose={() => setLightbox(null)} onFavorite={toggleFavorite} onVary={vary} onUpscale={upscale} onReference={setReference} />
    </ChatShell>
  );
}

/* ------------------------------------------------------------- settings */

function SettingsPopover({
  settings,
  onChange,
  creativity,
  onCreativity,
  hires,
  onHires,
}: {
  settings: GenSettings;
  onChange: (s: GenSettings) => void;
  creativity: number;
  onCreativity: (n: number) => void;
  hires: boolean;
  onHires: (v: boolean) => void;
}) {
  return (
    <Popover
      placement="top start"
      width="lg"
      title="生成设置"
      trigger={
        <Button variant="plain" tone="neutral" size="sm" startIcon={<RiEqualizer2Line />} className="px-2">
          <span className="tabular-nums">{settings.aspect}</span>
          <span className="max-sm:hidden">
            · {styleLabel(settings.style)} · {settings.count} 张
          </span>
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="画面比例">
          <SegmentedControl
            aria-label="画面比例"
            size="sm"
            fullWidth
            value={settings.aspect}
            onChange={(v) => onChange({ ...settings, aspect: v as Aspect })}
            options={ASPECTS.map((a) => ({
              id: a,
              label: (
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="inline-block max-h-3.5 max-w-3.5 rounded-[3px] border-[1.5px] border-current" style={{ aspectRatio: aspectCss(a), height: a === "16:9" || a === "4:3" ? "auto" : 14, width: a === "16:9" || a === "4:3" ? 14 : "auto" }} />
                  {a}
                </span>
              ),
            }))}
          />
        </Field>
        <Field label="风格">
          <ChipGroup
            aria-label="风格"
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[settings.style]}
            onSelectionChange={(keys: Selection) => {
              const k = keys === "all" ? undefined : [...keys][0];
              if (k != null) onChange({ ...settings, style: String(k) as ImageStyle });
            }}
          >
            {STYLES.map((s) => (
              <Chip key={s.id} id={s.id}>
                {s.label}
              </Chip>
            ))}
          </ChipGroup>
        </Field>
        <Field label="数量">
          <SegmentedControl
            aria-label="生成数量"
            size="sm"
            fullWidth
            value={String(settings.count)}
            onChange={(v) => onChange({ ...settings, count: Number(v) })}
            options={[
              { id: "1", label: "1 张" },
              { id: "2", label: "2 张" },
              { id: "4", label: "4 张" },
            ]}
          />
        </Field>
        <Slider
          label="创意度"
          value={creativity}
          onChange={(v) => onCreativity(Array.isArray(v) ? v[0]! : v)}
          showValue
          description={creativity < 35 ? "更贴近描述" : creativity > 70 ? "更大胆地发挥" : "平衡"}
        />
        <Switch isSelected={hires} onChange={onHires} description="多花约 2 秒，修复手部与文字细节">
          高清修复
        </Switch>
      </div>
    </Popover>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm font-medium text-fg">{label}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ the turn */

interface ImageActions {
  open: (id: string) => void;
  favorite: (id: string) => void;
  vary: (img: { art: string; prompt: string; aspect: Aspect; style: ImageStyle }, label: string) => void;
  upscale: (img: { art: string; prompt: string; aspect: Aspect; style: ImageStyle }, label: string) => void;
}

function GenerationTurn({ gen, favorites, actions, onRetry }: { gen: Generation; favorites: Set<string>; actions: ImageActions; onRetry: () => void }) {
  const modelName = IMAGE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model;
  const { aspect, style } = gen.settings;
  const wide = aspect === "16:9" || aspect === "4:3";
  const single = gen.arts.length === 1;
  const summary = [gen.kind === "upscale" ? "放大 ×2" : `${gen.arts.length} 张`, aspect, styleLabel(style), modelName].join(" · ");

  const gap = /\d$/.test(gen.source?.label ?? "") ? " " : "";
  const userText =
    gen.kind === "variation" ? `为${gen.source?.label}${gap}生成 4 个变体` : gen.kind === "upscale" ? `把${gen.source?.label}${gap}放大到 2 倍` : gen.prompt;

  return (
    <>
      <ChatMessage
        role="user"
        time={gen.time}
        attachments={
          gen.source ? (
            <ComposerAttachments items={[{ id: `${gen.id}-src`, name: `${gen.source.label}.svg`, size: 1_120, type: "image/svg+xml", previewUrl: artUrl(gen.source.art) }]} />
          ) : null
        }
      >
        {userText}
        {gen.kind === "prompt" ? (
          <span className="mt-2 flex flex-wrap gap-1.5">
            <Badge size="sm" variant="outline">
              {aspect}
            </Badge>
            <Badge size="sm" variant="outline">
              {styleLabel(style)}
            </Badge>
            <Badge size="sm" variant="outline">
              {gen.arts.length} 张
            </Badge>
          </span>
        ) : null}
      </ChatMessage>

      <ChatMessage
        role="assistant"
        time={gen.time}
        badge={
          <Badge size="sm" variant="outline">
            {modelName}
          </Badge>
        }
        actions={
          gen.status === "done" ? (
            <ChatMessageActions
              copyText={gen.prompt}
              onRetry={onRetry}
              extra={
                <span className="ms-2 text-caption text-fg-subtle tabular-nums max-sm:hidden">
                  种子 {gen.seed} · 用时 {gen.duration} 秒
                </span>
              }
            />
          ) : null
        }
      >
        {gen.status === "running" ? (
          <Progress
            label={gen.kind === "upscale" ? "正在放大细节…" : gen.progress < 40 ? "正在构图…" : gen.progress < 80 ? "正在细化光影…" : "正在修复细节…"}
            value={gen.progress}
            size="sm"
            className="max-w-sm"
          />
        ) : (
          <p className="text-body-sm text-fg-muted">{gen.status === "stopped" ? `已停止 · ${summary}` : summary}</p>
        )}
        <div
          className={cx(
            "grid gap-2",
            single ? "max-w-xs grid-cols-1" : wide ? "grid-cols-2" : gen.arts.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "max-w-md grid-cols-2",
          )}
        >
          {gen.arts.map((art, i) => {
            const id = imageId(gen, i);
            const label = `图 ${i + 1}`;
            const img = { art, prompt: gen.prompt, aspect, style };
            return (
              <ImageTile
                key={id}
                art={art}
                aspect={aspect}
                label={single ? (gen.kind === "upscale" ? pixelSize(aspect, 2) : label) : label}
                status={gen.status}
                progress={gen.progress}
                delay={i}
                favorite={favorites.has(id)}
                onOpen={() => actions.open(id)}
                onFavorite={() => actions.favorite(id)}
                onVary={gen.kind === "upscale" ? undefined : () => actions.vary(img, label)}
                onUpscale={gen.kind === "upscale" ? undefined : () => actions.upscale(img, label)}
                onDownload={() => download(art, `${gen.id}-${i + 1}`)}
              />
            );
          })}
        </div>
        {gen.status === "stopped" ? (
          <ChatNotice>
            生成已停止 ·{" "}
            <button type="button" onClick={onRetry} className="font-medium text-fg-accent hover:underline">
              重新生成
            </button>
          </ChatNotice>
        ) : null}
        {gen.status === "done" && !single ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" tone="neutral" startIcon={<RiShuffleLine />} onPress={() => actions.vary({ art: gen.arts[0]!, prompt: gen.prompt, aspect, style }, "图 1")}>
              以图 1 生成变体
            </Button>
            <Button size="sm" variant="outline" tone="neutral" startIcon={<RiRefreshLine />} onPress={onRetry}>
              重新生成
            </Button>
            <Button
              size="sm"
              variant="plain"
              tone="neutral"
              startIcon={<RiDownload2Line />}
              onPress={() => {
                gen.arts.forEach((art, i) => download(art, `${gen.id}-${i + 1}`));
                toast.success(`已下载 ${gen.arts.length} 张图片`);
              }}
            >
              全部下载
            </Button>
          </div>
        ) : null}
      </ChatMessage>
    </>
  );
}

function ImageTile({
  art,
  aspect,
  label,
  status,
  progress,
  delay,
  favorite,
  onOpen,
  onFavorite,
  onVary,
  onUpscale,
  onDownload,
}: {
  art: string;
  aspect: Aspect;
  label: string;
  status: Generation["status"];
  progress: number;
  delay: number;
  favorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  onVary?: () => void;
  onUpscale?: () => void;
  onDownload: () => void;
}) {
  const done = status === "done";
  // Each tile resolves a little behind the previous one.
  const p = Math.max(0, Math.min(100, progress * 1.15 - delay * 6));
  const imgStyle: CSSProperties = done ? {} : { filter: `blur(${Math.round(26 * (1 - p / 100))}px) saturate(${0.4 + p / 160})`, opacity: 0.2 + (0.8 * p) / 100 };
  return (
    <div
      className="group relative overflow-hidden rounded-menu border border-line bg-surface-muted shadow-xs"
      style={{ aspectRatio: aspectCss(aspect) }}
    >
      {!done ? <div aria-hidden className={cx("absolute inset-0", status === "running" && "bg-skeleton")} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artUrl(art)}
        alt={done ? `${label}：${ART[art]?.prompt ?? ""}` : ""}
        className={cx(
          "absolute inset-0 size-full object-cover transition-[filter,opacity,transform] duration-300 ease-out-soft",
          done && "group-hover:scale-[1.03]",
          status === "stopped" && "grayscale",
        )}
        style={imgStyle}
        draggable={false}
      />
      {done ? (
        <>
          <button type="button" onClick={onOpen} aria-label={`查看${label}`} className="absolute inset-0 outline-none focus-visible:focus-ring rounded-menu" />
          <span className="pointer-events-none absolute start-2 top-2 rounded-full bg-surface/85 px-2 py-0.5 text-micro font-medium text-fg tabular-nums backdrop-blur">
            {label}
          </span>
          <div className="absolute end-1.5 top-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 data-[on]:opacity-100 [@media(hover:none)]:opacity-100" data-on={favorite || undefined}>
            <Tooltip content={favorite ? "取消收藏" : "收藏"}>
              <IconButton
                size="sm"
                round
                icon={favorite ? <RiStarFill /> : <RiStarLine />}
                aria-label={favorite ? "取消收藏" : "收藏"}
                aria-pressed={favorite}
                onPress={onFavorite}
                className={cx("bg-surface/85 backdrop-blur", favorite && "text-warning")}
              />
            </Tooltip>
          </div>
          <div className="absolute inset-x-1.5 bottom-1.5 flex justify-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <div className="flex gap-0.5 rounded-full bg-surface/90 p-0.5 shadow-popover backdrop-blur">
              {onVary ? (
                <Tooltip content="生成变体">
                  <IconButton size="sm" round icon={<RiShuffleLine />} aria-label={`${label}生成变体`} onPress={onVary} />
                </Tooltip>
              ) : null}
              {onUpscale ? (
                <Tooltip content="放大 ×2">
                  <IconButton size="sm" round icon={<RiZoomInLine />} aria-label={`放大${label}`} onPress={onUpscale} />
                </Tooltip>
              ) : null}
              <Tooltip content="下载">
                <IconButton size="sm" round icon={<RiDownload2Line />} aria-label={`下载${label}`} onPress={onDownload} />
              </Tooltip>
            </div>
          </div>
        </>
      ) : (
        <span className="absolute end-2 bottom-2 rounded-full bg-surface/85 px-2 py-0.5 text-micro font-medium text-fg-muted tabular-nums backdrop-blur">
          {status === "stopped" ? "已停止" : `${Math.round(p)}%`}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- gallery */

function GalleryPanel({ images, onOpen, onFavorite }: { images: GalleryImage[]; onOpen: (id: string) => void; onFavorite: (id: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const shown = useMemo(
    () =>
      images.filter(
        (img) => (filter === "all" || (filter === "fav" ? img.favorite : img.style === filter)) && (!query.trim() || img.prompt.includes(query.trim())),
      ),
    [images, filter, query],
  );
  const groups = useMemo(() => {
    const map = new Map<string, GalleryImage[]>();
    for (const img of shown) map.set(img.when, [...(map.get(img.when) ?? []), img]);
    return [...map.entries()];
  }, [shown]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b border-line px-4 py-3">
        <SearchField aria-label="搜索提示词" placeholder="搜索提示词…" size="sm" value={query} onChange={setQuery} />
        <ChipGroup
          aria-label="按类型筛选"
          size="sm"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[filter]}
          onSelectionChange={(keys: Selection) => {
            const k = keys === "all" ? undefined : [...keys][0];
            if (k != null) setFilter(String(k));
          }}
        >
          <Chip id="all">全部</Chip>
          <Chip id="fav" icon={<RiStarLine />}>
            收藏
          </Chip>
          {STYLES.filter((s) => s.id !== "none").map((s) => (
            <Chip key={s.id} id={s.id}>
              {s.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>
      <div className="@container min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <RiImageCircleAiLine className="size-8 text-fg-subtle" />
            <p className="text-body-sm text-fg-muted">没有符合条件的作品</p>
          </div>
        ) : (
          groups.map(([when, list]) => (
            <section key={when} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-caption font-medium text-fg-subtle">
                {when} · {list.length}
              </h3>
              <div className="columns-2 gap-2 @[460px]:columns-3">
                {list.map((img) => (
                  <div key={img.id} className="group relative mb-2 break-inside-avoid overflow-hidden rounded-control border border-line bg-surface-muted motion-safe:animate-fade-in">
                    <button type="button" onClick={() => onOpen(img.id)} className="block w-full outline-none focus-visible:focus-ring rounded-control" aria-label={`查看：${img.prompt}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artUrl(img.art)} alt="" className="block w-full object-cover" style={{ aspectRatio: aspectCss(img.aspect) }} loading="lazy" draggable={false} />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 bg-surface/90 px-2 py-1.5 text-start text-micro text-fg opacity-0 backdrop-blur transition-opacity duration-150 group-hover:opacity-100">
                        {img.prompt}
                      </span>
                    </button>
                    {img.upscaled ? (
                      <span className="pointer-events-none absolute start-1.5 top-1.5 rounded-full bg-surface/85 px-1.5 py-px text-micro font-medium text-fg backdrop-blur">2×</span>
                    ) : null}
                    <IconButton
                      size="sm"
                      round
                      icon={img.favorite ? <RiStarFill /> : <RiStarLine />}
                      aria-label={img.favorite ? "取消收藏" : "收藏"}
                      aria-pressed={img.favorite}
                      onPress={() => onFavorite(img.id)}
                      className={cx(
                        "absolute end-1 top-1 bg-surface/85 backdrop-blur transition-opacity duration-150",
                        img.favorite ? "text-warning" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
                      )}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- lightbox */

function Lightbox({
  image,
  onClose,
  onFavorite,
  onVary,
  onUpscale,
  onReference,
}: {
  image: GalleryImage | null;
  onClose: () => void;
  onFavorite: (id: string) => void;
  onVary: ImageActions["vary"];
  onUpscale: ImageActions["upscale"];
  onReference: (img: GalleryImage) => void;
}) {
  // Keep showing the last image while the dialog animates out.
  const last = useRef<GalleryImage | null>(null);
  if (image) last.current = image;
  const shown = image ?? last.current;
  return (
    <Modal
      isOpen={!!image}
      onOpenChange={(open) => (open ? null : onClose())}
      title="作品详情"
      size="lg"
      footer={
        shown ? (
          <>
            <Button variant="plain" tone="neutral" startIcon={<RiImageAddLine />} onPress={() => onReference(shown)} className="me-auto max-sm:hidden">
              设为参考图
            </Button>
            <Button variant="outline" tone="neutral" startIcon={<RiShuffleLine />} onPress={() => onVary(shown, "所选图片")}>
              变体
            </Button>
            {!shown.upscaled ? (
              <Button variant="outline" tone="neutral" startIcon={<RiZoomInLine />} onPress={() => onUpscale(shown, "所选图片")}>
                放大
              </Button>
            ) : null}
            <Button startIcon={<RiDownload2Line />} onPress={() => download(shown.art, shown.id)}>
              下载
            </Button>
          </>
        ) : null
      }
    >
      {shown ? (
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex items-center justify-center overflow-hidden rounded-menu bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artUrl(shown.art)} alt={shown.prompt} className="max-h-[56vh] w-full object-cover" style={{ aspectRatio: aspectCss(shown.aspect) }} />
          </div>
          <dl className="flex flex-col gap-4 text-body-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-fg-subtle">提示词</dt>
              <dd className="text-fg">{shown.prompt}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <dt className="text-caption text-fg-subtle">比例</dt>
                <dd className="text-fg tabular-nums">{shown.aspect}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-caption text-fg-subtle">风格</dt>
                <dd className="text-fg">{styleLabel(shown.style)}</dd>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="text-caption text-fg-subtle">尺寸</dt>
                <dd className="text-fg tabular-nums">{pixelSize(shown.aspect, shown.upscaled ? 2 : 1)}</dd>
              </div>
            </div>
            <Button
              size="sm"
              variant={shown.favorite ? "soft" : "outline"}
              tone="neutral"
              startIcon={shown.favorite ? <RiStarFill className="text-warning" /> : <RiStarLine />}
              onPress={() => onFavorite(shown.id)}
              className="self-start"
            >
              {shown.favorite ? "已收藏" : "收藏"}
            </Button>
          </dl>
        </div>
      ) : null}
    </Modal>
  );
}
