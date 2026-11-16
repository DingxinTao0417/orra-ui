"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import {
  Autocomplete,
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Header,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  useFilter,
  useLocale,
} from "react-aria-components";
import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import { RiBrain2Line, RiCodeSSlashLine, RiEyeLine, RiFlashlightLine, RiSearchLine, RiStackLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { floatingPanel, focusRing, menuHeading } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { agentSeedHash } from "../agent-avatar/agent-avatar";
import { SearchField } from "../search-field/search-field";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Slider } from "../slider/slider";

const COPY = {
  en: {
    model: "Model",
    choose: "Choose a model",
    search: "Search models…",
    empty: "No models match “{query}”",
    effort: "Reasoning effort",
    low: "Low",
    medium: "Medium",
    high: "High",
    temperature: "Temperature",
    precise: "Precise",
    creative: "Creative",
    fast: "Fast",
    reasoning: "Reasoning",
    vision: "Vision",
    code: "Code",
    longContext: "Long context",
    isNew: "New",
    context: "{n} context",
  },
  zh: {
    model: "模型",
    choose: "选择模型",
    search: "搜索模型…",
    empty: "没有匹配“{query}”的模型",
    effort: "推理强度",
    low: "低",
    medium: "中",
    high: "高",
    temperature: "温度",
    precise: "严谨",
    creative: "发散",
    fast: "快速",
    reasoning: "推理",
    vision: "视觉",
    code: "编程",
    longContext: "长上下文",
    isNew: "新",
    context: "{n} 上下文",
  },
};
export type ModelPickerLabels = (typeof COPY)["en"];

export type ModelCapability = "fast" | "reasoning" | "vision" | "code" | "long-context";
export type ModelEffort = "low" | "medium" | "high";

export interface ModelOption {
  id: string;
  /** Display name, e.g. "Lumen 4 Pro". */
  name: string;
  /** Provider name; models are grouped by it, and it seeds the monogram. */
  provider: string;
  /** One line under the name. */
  description?: string;
  capabilities?: ModelCapability[];
  /** Context window in tokens, shown as "200K context". */
  contextWindow?: number;
  /** Mark as newly added. */
  isNew?: boolean;
  isDisabled?: boolean;
}

/** Sample catalogue with invented providers, used when `models` is omitted. Replace it with your own. */
export const MODEL_PICKER_SAMPLE: ModelOption[] = [
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "Deep reasoning for complex, multi-step work", capabilities: ["reasoning", "vision", "long-context"], contextWindow: 400_000 },
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "Quick answers and everyday drafting", capabilities: ["fast", "vision"], contextWindow: 200_000 },
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "Careful planner, strong at code review", capabilities: ["reasoning", "code"], contextWindow: 256_000, isNew: true },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "Lightweight and inexpensive", capabilities: ["fast"], contextWindow: 128_000 },
  { id: "fathom-72b", name: "Fathom 72B", provider: "Fathom", description: "Open-weights model you can self-host", capabilities: ["code"], contextWindow: 128_000 },
];

const CAPABILITY_ICON: Record<ModelCapability, ReactNode> = {
  fast: <RiFlashlightLine />,
  reasoning: <RiBrain2Line />,
  vision: <RiEyeLine />,
  code: <RiCodeSSlashLine />,
  "long-context": <RiStackLine />,
};

/* ------------------------------------------------------------ provider mark */

const MARK_HUES = [1, 2, 3, 4, 5, 6, 8];
const MARK_SIZE = { xs: "size-4 rounded-[5px] text-[9px]", sm: "size-5 rounded-[6px] text-[10px]", md: "size-7 rounded-[8px] text-caption" } as const;

export interface ModelProviderMarkProps {
  /** Provider name: picks the letter and colour. */
  name: string;
  size?: keyof typeof MARK_SIZE;
  className?: string;
}

/** A neutral, generated monogram for a model provider (first letter on a seeded tint). */
export function ModelProviderMark({ name, size = "sm", className }: ModelProviderMarkProps) {
  const hue = `var(--color-chart-${MARK_HUES[agentSeedHash(name) % MARK_HUES.length]})`;
  const letter = Array.from(name.trim())[0]?.toUpperCase() ?? "?";
  return (
    <span
      aria-hidden
      className={cx("inline-flex shrink-0 items-center justify-center font-semibold leading-none ring-1 ring-inset", MARK_SIZE[size], className)}
      style={
        {
          background: `linear-gradient(145deg, color-mix(in oklab, ${hue} 26%, var(--color-surface)), color-mix(in oklab, ${hue} 12%, var(--color-surface)))`,
          color: `color-mix(in oklab, ${hue} 72%, var(--color-fg))`,
          "--tw-ring-color": `color-mix(in oklab, ${hue} 28%, transparent)`,
        } as CSSProperties
      }
    >
      {letter}
    </span>
  );
}

/* ------------------------------------------------------------------ picker */

export interface ModelPickerProps extends Pick<AriaPopoverProps, "placement"> {
  /** Models to offer (default: an invented sample catalogue). */
  models?: ModelOption[];
  /** Selected model id (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Footer control: reasoning `effort` (default), `temperature`, or `none`. */
  control?: "effort" | "temperature" | "none";
  effort?: ModelEffort;
  defaultEffort?: ModelEffort;
  onEffortChange?: (effort: ModelEffort) => void;
  temperature?: number;
  defaultTemperature?: number;
  onTemperatureChange?: (value: number) => void;
  /** Show the search field (default: when there are more than 4 models). */
  searchable?: boolean;
  /** Trigger look: `outline` (default) or `ghost` for composer toolbars. */
  variant?: "outline" | "ghost";
  size?: "sm" | "md";
  isDisabled?: boolean;
  labels?: Partial<ModelPickerLabels>;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Pick an AI model: a compact trigger opens a searchable popover grouped by
 * provider, with capability badges and a reasoning-effort (or temperature)
 * control underneath.
 *
 *   <ModelPicker defaultValue="lumen-4-pro" onChange={setModel} />
 */
export function ModelPicker({
  models = MODEL_PICKER_SAMPLE,
  value,
  defaultValue,
  onChange,
  control = "effort",
  effort,
  defaultEffort = "medium",
  onEffortChange,
  temperature,
  defaultTemperature = 0.7,
  onTemperatureChange,
  searchable,
  variant = "outline",
  size = "md",
  placement = "bottom start",
  isDisabled,
  labels,
  className,
  ref,
}: ModelPickerProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const { contains } = useFilter({ sensitivity: "base" });
  const [selected, setSelected] = useControllableState(value, defaultValue ?? models[0]?.id ?? "", onChange);
  const [currentEffort, setEffort] = useControllableState(effort, defaultEffort, onEffortChange);
  const [temp, setTemp] = useControllableState(temperature, defaultTemperature, onTemperatureChange);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const current = models.find((m) => m.id === selected);
  const showSearch = searchable ?? models.length > 4;
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 0 });

  const groups = useMemo(() => {
    const map = new Map<string, ModelOption[]>();
    for (const m of models) map.set(m.provider, [...(map.get(m.provider) ?? []), m]);
    return [...map.entries()];
  }, [models]);

  const capabilityLabel: Record<ModelCapability, string> = {
    fast: t.fast,
    reasoning: t.reasoning,
    vision: t.vision,
    code: t.code,
    "long-context": t.longContext,
  };
  const effortLabel: Record<ModelEffort, string> = { low: t.low, medium: t.medium, high: t.high };

  const list = (
    <ListBox
      aria-label={t.choose}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={selected ? [selected] : []}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next != null) {
          setSelected(String(next));
          setOpen(false);
        }
      }}
      renderEmptyState={() => <p className="px-3 py-8 text-center text-body-sm text-fg-subtle">{fill(t.empty, { query })}</p>}
      className="max-h-80 overflow-y-auto p-1 outline-none"
    >
      {groups.map(([provider, items]) => (
        <ListBoxSection key={provider} id={provider} className="[&:not(:first-child)]:mt-1">
          <Header className={cx(menuHeading, "flex items-center gap-2")}>
            <ModelProviderMark name={provider} size="xs" />
            {provider}
          </Header>
          {items.map((m) => (
            <ListBoxItem
              key={m.id}
              id={m.id}
              textValue={`${m.name} ${m.provider} ${m.description ?? ""}`}
              isDisabled={m.isDisabled}
              className={cx(
                "group relative flex cursor-default items-start gap-2.5 rounded-[10px] px-2.5 py-2 outline-none",
                "data-[focused]:bg-surface-hover data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-body font-medium text-fg">{m.name}</span>
                  {m.isNew ? <span className="rounded-full bg-accent-50 px-1.5 text-micro font-medium leading-4 text-fg-accent">{t.isNew}</span> : null}
                </span>
                {m.description ? <span className="text-caption text-fg-subtle">{m.description}</span> : null}
                {m.capabilities?.length || m.contextWindow ? (
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    {m.capabilities?.map((c) => (
                      <span
                        key={c}
                        className="inline-flex h-5 items-center gap-1 rounded-[6px] bg-surface-muted px-1.5 text-micro font-medium text-fg-muted group-data-[focused]:bg-surface [&>svg]:size-3"
                      >
                        {CAPABILITY_ICON[c]}
                        {capabilityLabel[c]}
                      </span>
                    ))}
                    {m.contextWindow ? (
                      <span className="px-1 text-micro text-fg-subtle tabular-nums">{fill(t.context, { n: compact.format(m.contextWindow) })}</span>
                    ) : null}
                  </span>
                ) : null}
              </span>
              <CheckGlyph className="mt-1 size-4 shrink-0 text-fg-accent opacity-0 group-data-[selected]:opacity-100" />
            </ListBoxItem>
          ))}
        </ListBoxSection>
      ))}
    </ListBox>
  );

  return (
    <DialogTrigger
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <AriaButton
        ref={ref}
        isDisabled={isDisabled}
        aria-label={current ? `${t.model}: ${current.name}` : t.choose}
        className={cx(
          "inline-flex min-w-0 cursor-default items-center gap-2 rounded-control font-medium text-fg transition-colors duration-150",
          "data-[disabled]:opacity-45 data-[pressed]:bg-surface-active",
          variant === "outline" ? "border border-line-strong bg-surface shadow-xs data-[hovered]:bg-surface-hover" : "data-[hovered]:bg-surface-hover",
          size === "sm" ? "h-8 px-2 text-body-sm" : "h-9 px-2.5 text-body",
          focusRing,
          className,
        )}
      >
        {current ? <ModelProviderMark name={current.provider} size={size === "sm" ? "xs" : "sm"} /> : null}
        <span className="truncate">{current?.name ?? t.choose}</span>
        {control === "effort" && current?.capabilities?.includes("reasoning") ? (
          <span className="shrink-0 text-fg-subtle">· {effortLabel[currentEffort]}</span>
        ) : null}
        <ChevronGlyph className="size-3.5 shrink-0 text-fg-subtle" />
      </AriaButton>
      <AriaPopover placement={placement} offset={6} className={cx(floatingPanel, "w-[340px] max-w-[calc(100vw-1.5rem)] p-0")}>
        <Dialog aria-label={t.choose} className="flex max-h-[inherit] flex-col outline-none">
          {showSearch ? (
            <Autocomplete inputValue={query} onInputChange={setQuery} filter={contains}>
              <div className="border-b border-line p-2">
                <SearchField aria-label={t.search} placeholder={t.search} size="sm" autoFocus icon={<RiSearchLine />} />
              </div>
              {list}
            </Autocomplete>
          ) : (
            list
          )}
          {control !== "none" ? (
            <div className="border-t border-line bg-surface-muted/50 px-3 pt-2.5 pb-3">
              {control === "effort" ? (
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-fg-muted">{t.effort}</span>
                  <SegmentedControl
                    aria-label={t.effort}
                    size="sm"
                    fullWidth
                    value={currentEffort}
                    onChange={(v) => setEffort(v as ModelEffort)}
                    isDisabled={!!current && !current.capabilities?.includes("reasoning")}
                    options={[
                      { id: "low", label: t.low },
                      { id: "medium", label: t.medium },
                      { id: "high", label: t.high },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Slider
                    label={t.temperature}
                    minValue={0}
                    maxValue={2}
                    step={0.1}
                    value={temp}
                    onChange={(v) => setTemp(v as number)}
                    formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  />
                  <div className="flex justify-between text-micro text-fg-subtle">
                    <span>{t.precise}</span>
                    <span>{t.creative}</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
