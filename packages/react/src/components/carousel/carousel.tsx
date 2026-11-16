"use client";

import { Children, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode, Ref } from "react";
import { Button as AriaButton, useLocale } from "react-aria-components";
import { RiArrowLeftSLine, RiArrowRightSLine, RiPauseLine, RiPlayLine } from "@remixicon/react";
import { useReducedMotion } from "motion/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import { IconButton } from "../icon-button/icon-button";

const COPY = {
  en: {
    carousel: "Carousel",
    slide: "{n} of {total}",
    previous: "Previous slide",
    next: "Next slide",
    goTo: "Go to slide {n}",
    pause: "Pause autoplay",
    play: "Start autoplay",
  },
  zh: {
    carousel: "轮播",
    slide: "第 {n} 张，共 {total} 张",
    previous: "上一张",
    next: "下一张",
    goTo: "前往第 {n} 张",
    pause: "暂停自动播放",
    play: "开始自动播放",
  },
};
export type CarouselLabels = (typeof COPY)["en"];

export interface CarouselProps {
  /** One child per slide (cards, images…). */
  children: ReactNode;
  /** Accessible name of the carousel, e.g. "精选模板". */
  "aria-label"?: string;
  /** Width of each slide (any CSS length). "100%" shows one; "85%" lets the next one peek; "calc((100% - 32px) / 3)" shows three. */
  slideSize?: string;
  /** Gap between slides in px. */
  gap?: number;
  /** Previous / next buttons: over the slides, in the footer next to the dots, or hidden. */
  arrows?: "overlay" | "footer" | false;
  /** Show the pagination dots. */
  dots?: boolean;
  /** Advance automatically every N ms (pauses on hover, focus and with reduced motion). */
  autoplay?: number;
  /** Wrap from the last slide to the first (always on while autoplaying). */
  loop?: boolean;
  /** Controlled active slide index. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  labels?: Partial<CarouselLabels>;
  className?: string;
  /** Extra classes for every slide wrapper. */
  slideClassName?: string;
  ref?: Ref<HTMLElement>;
}

/**
 * Horizontal slider with scroll snapping, previous/next buttons, dots,
 * optional autoplay and arrow-key support. Each child becomes a slide.
 *
 *   <Carousel aria-label="精选模板" slideSize="85%">
 *     {templates.map((t) => <TemplateCard key={t.id} {...t} />)}
 *   </Carousel>
 */
export function Carousel({
  children,
  "aria-label": ariaLabel,
  slideSize = "100%",
  gap = 16,
  arrows = "overlay",
  dots = true,
  autoplay,
  loop = false,
  index,
  defaultIndex = 0,
  onIndexChange,
  labels,
  className,
  slideClassName,
  ref,
}: CarouselProps) {
  const t = useCopy(COPY, labels);
  const { direction } = useLocale();
  const rtl = direction === "rtl";
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children).filter(isValidElement);
  const count = slides.length;

  const [active, setActive] = useState(defaultIndex);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(count <= 1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const wraps = loop || autoplay != null;

  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;
  const activeRef = useRef(active);

  const scrollToIndex = useCallback(
    (i: number, smooth = true) => {
      const track = trackRef.current;
      const slide = track?.children[i] as HTMLElement | undefined;
      if (!track || !slide) return;
      const trackRect = track.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const padStart = parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
      const delta = rtl ? slideRect.right - trackRect.right + padStart : slideRect.left - trackRect.left - padStart;
      track.scrollBy({ left: delta, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    },
    [rtl, reduceMotion],
  );

  // Track the slide nearest to the start edge as the active one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      const pos = Math.abs(track.scrollLeft);
      const start = pos <= 2;
      const end = pos >= max - 2;
      setAtStart(start);
      setAtEnd(end);
      const trackRect = track.getBoundingClientRect();
      const padStart = parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
      const edge = rtl ? trackRect.right - padStart : trackRect.left + padStart;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const d = Math.abs((rtl ? r.right : r.left) - edge);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      const next = end && max > 0 ? track.children.length - 1 : best;
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
        onIndexChangeRef.current?.(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rtl, count]);

  // Start at defaultIndex without animation.
  useEffect(() => {
    if (defaultIndex > 0) scrollToIndex(defaultIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled index.
  useEffect(() => {
    if (index != null && index !== activeRef.current) scrollToIndex(index);
  }, [index, scrollToIndex]);

  const go = useCallback(
    (step: 1 | -1) => {
      const current = activeRef.current;
      if (step === 1) {
        if (atEnd || current >= count - 1) {
          if (wraps) scrollToIndex(0);
          return;
        }
        scrollToIndex(current + 1);
      } else {
        if (atStart || current <= 0) {
          if (wraps) scrollToIndex(count - 1);
          return;
        }
        scrollToIndex(current - 1);
      }
    },
    [atEnd, atStart, count, wraps, scrollToIndex],
  );

  const playing = autoplay != null && !userPaused && !hovered && !focused && !reduceMotion && count > 1;
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") go(1);
    }, autoplay);
    return () => window.clearInterval(id);
  }, [playing, autoplay, go]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward) go(1);
    else if (e.key === back) go(-1);
    else if (e.key === "Home") scrollToIndex(0);
    else if (e.key === "End") scrollToIndex(count - 1);
    else return;
    e.preventDefault();
  };

  const canPrev = wraps ? count > 1 : !atStart;
  const canNext = wraps ? count > 1 : !atEnd;
  const prevButton = (
    <IconButton
      aria-label={t.previous}
      icon={<RiArrowLeftSLine className="rtl:-scale-x-100" />}
      variant="outline"
      tone="neutral"
      size="sm"
      round
      isDisabled={!canPrev}
      onPress={() => go(-1)}
      className={cx(arrows === "overlay" && "absolute start-3 top-1/2 z-10 -translate-y-1/2 bg-surface/90 shadow-raised backdrop-blur data-[disabled]:opacity-0")}
    />
  );
  const nextButton = (
    <IconButton
      aria-label={t.next}
      icon={<RiArrowRightSLine className="rtl:-scale-x-100" />}
      variant="outline"
      tone="neutral"
      size="sm"
      round
      isDisabled={!canNext}
      onPress={() => go(1)}
      className={cx(arrows === "overlay" && "absolute end-3 top-1/2 z-10 -translate-y-1/2 bg-surface/90 shadow-raised backdrop-blur data-[disabled]:opacity-0")}
    />
  );

  return (
    <section
      ref={ref}
      aria-roledescription="carousel"
      aria-label={ariaLabel ?? t.carousel}
      className={cx("flex w-full min-w-0 flex-col gap-3", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-live={playing ? "off" : "polite"}
          onKeyDown={onKeyDown}
          style={{ "--orra-slide": slideSize, gap: `${gap}px` } as CSSProperties}
          className={cx(
            "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-card",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            focusRing,
          )}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key ?? i}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(t.slide, { n: i + 1, total: count })}
              className={cx("min-w-0 shrink-0 grow-0 basis-[var(--orra-slide)] snap-start", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
        {arrows === "overlay" && count > 1 ? (
          <>
            {prevButton}
            {nextButton}
          </>
        ) : null}
      </div>

      {(dots || arrows === "footer" || autoplay != null) && count > 1 ? (
        <div className={cx("flex items-center gap-2", arrows === "footer" ? "justify-between" : "justify-center")}>
          <div className="flex items-center gap-1">
            {autoplay != null ? (
              <IconButton
                aria-label={userPaused ? t.play : t.pause}
                icon={userPaused ? <RiPlayLine /> : <RiPauseLine />}
                size="sm"
                round
                onPress={() => setUserPaused((p) => !p)}
                className="size-7"
              />
            ) : null}
            {dots ? (
              <div className="flex items-center">
                {slides.map((_, i) => (
                  <AriaButton
                    key={i}
                    aria-label={fill(t.goTo, { n: i + 1 })}
                    aria-current={i === active ? "true" : undefined}
                    onPress={() => scrollToIndex(i)}
                    className={cx("group/dot flex h-6 cursor-default items-center px-1 outline-none", "rounded-full data-[focus-visible]:focus-ring")}
                  >
                    <span
                      className={cx(
                        "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out-soft",
                        i === active ? "w-5 bg-accent-500" : "w-1.5 bg-line-strong group-data-[hovered]/dot:bg-line-hover",
                      )}
                    />
                  </AriaButton>
                ))}
              </div>
            ) : null}
          </div>
          {arrows === "footer" ? (
            <div className="flex items-center gap-2">
              {prevButton}
              {nextButton}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
