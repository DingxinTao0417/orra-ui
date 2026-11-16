"use client";

import { useEffect, useRef, useState } from "react";

/** Scales its content down (never up) to fit the box; mounts lazily when near the viewport. */
export function FitScale({ children, padding = 16, max = 1 }: { children: React.ReactNode; padding?: number; max?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const measure = () => {
      const w = inner.scrollWidth;
      const h = inner.scrollHeight;
      if (!w || !h) return;
      const s = Math.min(max, (box.clientWidth - padding * 2) / w, (box.clientHeight - padding * 2) / h);
      setScale(Math.max(0.2, s));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(inner);
    measure();
    return () => ro.disconnect();
  }, [visible, padding, max]);

  return (
    <div ref={boxRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {visible ? (
        <div ref={innerRef} className="w-max shrink-0" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
