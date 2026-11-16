"use client";

import { isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
} from "react-aria-components";
import type { QueuedToast } from "react-aria-components";
import { RiCheckboxCircleFill, RiCloseCircleFill, RiErrorWarningFill, RiInformationFill } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { SpinnerGlyph } from "../../lib/glyphs";
import { Button } from "../button/button";
import { CloseButton } from "../close-button/close-button";


/* ===========================================================================
 * Toast store: module-level state behind the imperative `toast()` API.
 * React Aria's ToastQueue keeps order + accessibility; this store adds
 * update-in-place, pausable per-toast timers and exit animations.
 * ======================================================================== */

export type ToastTone = "neutral" | "success" | "error" | "warning" | "info" | "loading";

export interface ToastAction {
  label: ReactNode;
  onPress: () => void;
  /** Close the toast after the action runs (default true). */
  dismiss?: boolean;
}

export interface ToastOptions {
  /** Pass an existing id to update that toast in place. */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Custom icon element, or `false` for none. */
  icon?: ReactNode | false;
  action?: ToastAction;
  /** Auto-dismiss delay in ms. `Infinity` (or 0) keeps it until dismissed. Defaults to the Toaster's duration. */
  duration?: number;
  /** Show the close button (default true). */
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface ToastRecord extends Omit<ToastOptions, "id"> {
  id: string;
  /** Key in the React Aria queue. */
  key: string;
  exiting: boolean;
  createdAt: number;
}

class PausableTimer {
  private handle: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  constructor(
    private remaining: number,
    private readonly onDone: () => void,
    paused: boolean,
  ) {
    if (!paused) this.resume();
  }
  pause() {
    if (this.handle === null) return;
    clearTimeout(this.handle);
    this.handle = null;
    this.remaining -= Date.now() - this.startedAt;
  }
  resume() {
    if (this.handle !== null) return;
    this.startedAt = Date.now();
    this.handle = setTimeout(this.onDone, Math.max(0, this.remaining));
  }
  clear() {
    if (this.handle !== null) clearTimeout(this.handle);
    this.handle = null;
  }
}

const EXIT_MS = 180;

const toastQueue = new ToastQueue<string>({ maxVisibleToasts: 100 });
const records = new Map<string, ToastRecord>();
const timers = new Map<string, PausableTimer>();
const listeners = new Set<() => void>();
let version = 0;
let paused = false;
let counter = 0;

const toastConfig = { duration: 5000 };

function emit() {
  version++;
  for (const fn of listeners) fn();
}

function subscribeToasts(fn: () => void) {
  listeners.add(fn);
  const unsub = toastQueue.subscribe(fn);
  return () => {
    listeners.delete(fn);
    unsub();
  };
}
const getToastVersion = () => version;
const getToastRecord = (id: string) => records.get(id);

function schedule(id: string) {
  timers.get(id)?.clear();
  timers.delete(id);
  const rec = records.get(id);
  if (!rec || rec.exiting) return;
  const duration = rec.tone === "loading" ? Infinity : (rec.duration ?? toastConfig.duration);
  if (!duration || !Number.isFinite(duration)) return;
  timers.set(id, new PausableTimer(duration, () => dismissToast(id), paused));
}

function pauseToasts() {
  paused = true;
  for (const t of timers.values()) t.pause();
}
function resumeToasts() {
  paused = false;
  for (const t of timers.values()) t.resume();
}

function showToast(options: ToastOptions): string {
  const { id: given, ...data } = options;
  if (given && records.has(given)) {
    updateToast(given, data);
    return given;
  }
  const id = given ?? `toast-${++counter}`;
  const key = toastQueue.add(id);
  records.set(id, { tone: "neutral", ...data, id, key, exiting: false, createdAt: Date.now() });
  schedule(id);
  emit();
  return id;
}

function updateToast(id: string, patch: Omit<ToastOptions, "id">) {
  const rec = records.get(id);
  if (!rec) return;
  const toneChanged = patch.tone !== undefined && patch.tone !== rec.tone;
  records.set(id, { ...rec, ...patch });
  if (toneChanged || patch.duration !== undefined) schedule(id);
  emit();
}

function dismissToast(id?: string) {
  const ids = id ? [id] : [...records.keys()];
  for (const key of ids) {
    const rec = records.get(key);
    if (!rec || rec.exiting) continue;
    timers.get(key)?.clear();
    timers.delete(key);
    records.set(key, { ...rec, exiting: true });
    setTimeout(() => {
      const current = records.get(key);
      records.delete(key);
      if (current) toastQueue.close(current.key);
      current?.onDismiss?.();
      emit();
    }, EXIT_MS);
  }
  emit();
}

/* ------------------------------------------------------------ public API */

type ToastInput = ReactNode | ToastOptions;

function normalize(input: ToastInput, options?: ToastOptions): ToastOptions {
  const isOptions = typeof input === "object" && input !== null && !isValidElement(input) && !Array.isArray(input) && !(Symbol.iterator in input);
  return isOptions ? { ...(input as ToastOptions), ...options } : { ...options, title: input as ReactNode };
}

export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
  /** Optional description per phase. */
  description?: { loading?: ReactNode; success?: ReactNode; error?: ReactNode };
}

export interface ToastFunction {
  (input: ToastInput, options?: ToastOptions): string;
  success(input: ToastInput, options?: ToastOptions): string;
  error(input: ToastInput, options?: ToastOptions): string;
  warning(input: ToastInput, options?: ToastOptions): string;
  info(input: ToastInput, options?: ToastOptions): string;
  loading(input: ToastInput, options?: ToastOptions): string;
  /** Shows a loading toast that turns into success / error when the promise settles. Returns the promise. */
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>, options?: ToastOptions): Promise<T>;
  /** Changes an existing toast in place (title, tone, description…). */
  update(id: string, options: Omit<ToastOptions, "id">): void;
  /** Dismisses one toast, or all of them without an id. */
  dismiss(id?: string): void;
}

const withTone = (tone: ToastTone) => (input: ToastInput, options?: ToastOptions) => showToast({ ...normalize(input, options), tone });

/**
 * Imperative toasts. Render one `<Toaster />` near the root, then call:
 *
 *   toast("Saved");
 *   toast.success("Invite sent", { description: "lin@example.com" });
 *   const id = toast.loading("Uploading…"); toast.update(id, { tone: "success", title: "Uploaded" });
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
 */
export const toast: ToastFunction = Object.assign((input: ToastInput, options?: ToastOptions) => showToast(normalize(input, options)), {
  success: withTone("success"),
  error: withTone("error"),
  warning: withTone("warning"),
  info: withTone("info"),
  loading: withTone("loading"),
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>, options?: ToastOptions) {
    const p = typeof promise === "function" ? promise() : promise;
    const id = showToast({ ...options, title: messages.loading, description: messages.description?.loading, tone: "loading" });
    p.then(
      (value) =>
        updateToast(id, {
          tone: "success",
          title: typeof messages.success === "function" ? messages.success(value) : messages.success,
          description: messages.description?.success,
        }),
      (error: unknown) =>
        updateToast(id, {
          tone: "error",
          title: typeof messages.error === "function" ? messages.error(error) : messages.error,
          description: messages.description?.error,
        }),
    );
    return p;
  },
  update: updateToast,
  dismiss: dismissToast,
});

/* ------------------------------------------------- single active Toaster */

const owners: string[] = [];
function claimToaster(id: string) {
  owners.push(id);
  emit();
  return () => {
    const i = owners.indexOf(id);
    if (i >= 0) owners.splice(i, 1);
    emit();
  };
}
const isActiveToaster = (id: string) => owners[owners.length - 1] === id;

/* ===========================================================================
 * <Toaster />
 * ======================================================================== */

const COPY = {
  en: { region: "Notifications", close: "Dismiss" },
  zh: { region: "通知", close: "关闭" },
};
export type ToasterLabels = (typeof COPY)["en"];

export type ToasterPlacement = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

const PLACEMENT: Record<ToasterPlacement, string> = {
  "top-start": "top-4 start-4",
  "top-center": "top-4 inset-x-0 mx-auto",
  "top-end": "top-4 end-4",
  "bottom-start": "bottom-4 start-4",
  "bottom-center": "bottom-4 inset-x-0 mx-auto",
  "bottom-end": "bottom-4 end-4",
};

const TONE_ICON: Record<ToastTone, ReactNode> = {
  neutral: null,
  success: <RiCheckboxCircleFill className="text-success" />,
  error: <RiCloseCircleFill className="text-danger" />,
  warning: <RiErrorWarningFill className="text-warning" />,
  info: <RiInformationFill className="text-info" />,
  loading: <SpinnerGlyph className="text-fg-subtle" />,
};

const GAP = 10;
const PEEK = 12;

export interface ToasterProps {
  placement?: ToasterPlacement;
  /** Default auto-dismiss delay in ms (default 5000). */
  duration?: number;
  /** How many toasts are shown at once; older ones wait (default 4). */
  visibleToasts?: number;
  /** Keep the stack expanded instead of collapsing it until hover / focus. */
  expanded?: boolean;
  className?: string;
  labels?: Partial<ToasterLabels>;
}

/**
 * The region that renders toasts created with `toast()`. Toasts stack and
 * fan out on hover or keyboard focus (F6 jumps to the region), timers pause
 * while you read, and each toast can carry an action and a close button.
 * Render it once near the root; if several are mounted, the most recent one shows the toasts.
 */
export function Toaster({ placement = "bottom-end", duration = 5000, visibleToasts = 4, expanded: alwaysExpanded, className, labels }: ToasterProps) {
  const t = useCopy(COPY, labels);
  const ownerId = useId();
  useSyncExternalStore(subscribeToasts, getToastVersion, getToastVersion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});

  useEffect(() => claimToaster(ownerId), [ownerId]);

  // Track focus inside the (portalled) region to pause timers and fan out the stack.
  const cleanupFocus = useRef<(() => void) | null>(null);
  const regionRef = useCallback((el: HTMLDivElement | null) => {
    cleanupFocus.current?.();
    cleanupFocus.current = null;
    if (!el) return;
    const onIn = () => setFocused(true);
    const onOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    el.addEventListener("focusin", onIn);
    el.addEventListener("focusout", onOut);
    cleanupFocus.current = () => {
      el.removeEventListener("focusin", onIn);
      el.removeEventListener("focusout", onOut);
      setFocused(false);
    };
  }, []);
  useEffect(() => {
    toastConfig.duration = duration;
  }, [duration]);

  const interacting = hovered || focused;
  useEffect(() => {
    if (interacting) pauseToasts();
    else resumeToasts();
  }, [interacting]);

  if (!isActiveToaster(ownerId)) return null;

  const fromTop = placement.startsWith("top");
  const expanded = alwaysExpanded || interacting;
  const visible = toastQueue.visibleToasts.slice(0, visibleToasts);
  const frontHeight = (visible[0] && heights[visible[0].key]) || 64;

  let offset = 0;
  const layout = new Map<string, { y: number; scale: number; height?: number; hidden: boolean; muted: boolean; index: number }>();
  visible.forEach((q, index) => {
    const own = heights[q.key];
    if (expanded) {
      layout.set(q.key, { y: offset, scale: 1, height: own, hidden: false, muted: false, index });
      offset += (own ?? frontHeight) + GAP;
    } else {
      layout.set(q.key, { y: index * PEEK, scale: 1 - index * 0.05, height: index === 0 ? own : frontHeight, hidden: index > 2, muted: index > 0, index });
    }
  });
  const stackHeight = expanded ? Math.max(0, offset - GAP) : frontHeight + Math.min(visible.length - 1, 2) * PEEK;

  return (
    <AriaToastRegion
      queue={toastQueue}
      aria-label={t.region}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={regionRef}
      style={{ height: stackHeight }}
      className={cx(
        "fixed z-[60] w-[min(380px,calc(100vw-2rem))] outline-none transition-[height] duration-300 ease-out-soft",
        PLACEMENT[placement],
        className,
      )}
    >
      {({ toast: queued }) => {
        const pos = layout.get(queued.key);
        return (
          <ToastCard
            queued={queued}
            pos={pos}
            fromTop={fromTop}
            closeLabel={t.close}
            onHeight={(h) => setHeights((prev) => (prev[queued.key] === h ? prev : { ...prev, [queued.key]: h }))}
          />
        );
      }}
    </AriaToastRegion>
  );
}

interface ToastCardProps {
  queued: QueuedToast<string>;
  pos?: { y: number; scale: number; height?: number; hidden: boolean; muted: boolean; index: number };
  fromTop: boolean;
  closeLabel: string;
  onHeight: (height: number) => void;
}

function ToastCard({ queued, pos, fromTop, closeLabel, onHeight }: ToastCardProps) {
  const rec = getToastRecord(queued.content);
  const innerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const onHeightRef = useRef(onHeight);
  onHeightRef.current = onHeight;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => onHeightRef.current(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!rec) return null;
  const gone = !pos || pos.hidden;
  const sign = fromTop ? 1 : -1;
  const y = !entered ? sign * -24 : rec.exiting ? sign * (pos?.y ?? 0) + sign * -12 : sign * (pos?.y ?? 0);
  const style: CSSProperties = {
    transform: `translateY(${y}px) scale(${entered && !rec.exiting ? (pos?.scale ?? 1) : 0.96})`,
    opacity: !entered || rec.exiting || gone ? 0 : 1,
    height: pos?.height,
    zIndex: 100 - (pos?.index ?? 99),
    transformOrigin: fromTop ? "bottom center" : "top center",
    pointerEvents: gone ? "none" : undefined,
  };
  const icon = rec.icon === false ? null : (rec.icon ?? TONE_ICON[rec.tone ?? "neutral"]);

  return (
    <AriaToast
      toast={queued}
      style={style}
      className={cx(
        "absolute inset-x-0 overflow-hidden rounded-menu bg-surface-raised text-fg shadow-popover outline-none",
        "transition-[transform,opacity,height] duration-300 ease-out-soft motion-reduce:transition-none",
        "data-[focus-visible]:focus-ring",
        fromTop ? "top-0" : "bottom-0",
      )}
    >
      <div ref={innerRef} className={cx("flex items-start gap-3 p-3.5 transition-opacity duration-200", pos?.muted ? "opacity-0" : "opacity-100")}>
        {icon ? <span className="mt-px inline-flex size-5 shrink-0 [&>svg]:size-full">{icon}</span> : null}
        <AriaToastContent className="flex min-w-0 flex-1 flex-col gap-0.5 pt-px">
          <Text slot="title" className="text-body font-medium text-fg">
            {rec.title}
          </Text>
          {rec.description ? (
            <Text slot="description" className="text-body-sm text-fg-muted">
              {rec.description}
            </Text>
          ) : null}
        </AriaToastContent>
        {rec.action ? (
          <Button
            size="sm"
            variant="soft"
            tone="neutral"
            className="-my-0.5 shrink-0"
            onPress={() => {
              rec.action?.onPress();
              if (rec.action?.dismiss !== false) dismissToast(rec.id);
            }}
          >
            {rec.action.label}
          </Button>
        ) : null}
        {rec.dismissible !== false ? (
          <CloseButton size="sm" aria-label={closeLabel} className="-me-1 -mt-0.5" onPress={() => dismissToast(rec.id)} />
        ) : null}
      </div>
    </AriaToast>
  );
}
