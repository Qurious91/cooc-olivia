"use client";

import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  image: string;
  chip?: string;
  title: string;
  subtitle?: string;
};

export default function HeroSlider({
  slides,
  minHeight = "min-h-80",
  sharedCaption,
}: {
  slides: HeroSlide[];
  minHeight?: string;
  sharedCaption?: {
    chip?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
  };
}) {
  const n = slides.length;
  const ext = [slides[n - 1], ...slides, slides[0]];

  const ref = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null);
  const jumpingRef = useRef(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    jumpingRef.current = true;
    el.style.scrollBehavior = "auto";
    el.scrollLeft = el.clientWidth;
    requestAnimationFrame(() => {
      el.style.scrollBehavior = "";
      jumpingRef.current = false;
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const settle = () => {
      if (jumpingRef.current) return;
      const w = el.clientWidth;
      if (w === 0) return;
      const i = Math.round(el.scrollLeft / w);
      if (i !== 0 && i !== n + 1) return;
      const realPos = i === 0 ? n * w : w;
      jumpingRef.current = true;
      el.style.scrollBehavior = "auto";
      el.scrollLeft = realPos;
      requestAnimationFrame(() => {
        el.style.scrollBehavior = "";
        jumpingRef.current = false;
      });
    };

    if ("onscrollend" in window) {
      el.addEventListener("scrollend", settle);
      return () => el.removeEventListener("scrollend", settle);
    }

    let timer: number | null = null;
    const debounced = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(settle, 150);
    };
    el.addEventListener("scroll", debounced);
    return () => {
      el.removeEventListener("scroll", debounced);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [n]);

  const onScroll = () => {
    if (jumpingRef.current) return;
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    const real = ((i - 1) % n + n) % n;
    if (real !== slide) setSlide(real);
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: (i + 1) * el.clientWidth, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    const el = ref.current;
    if (!st || !el) return;
    if (e.buttons === 0) {
      endDrag();
      return;
    }
    el.scrollLeft = st.startScroll - (e.clientX - st.startX);
  };

  const endDrag = () => {
    const el = ref.current;
    const st = dragRef.current;
    dragRef.current = null;
    if (!el || !st) return;
    const w = el.clientWidth;
    const startIdx = Math.round(st.startScroll / w);
    const delta = el.scrollLeft - st.startScroll;
    const threshold = w * 0.15;
    const dir = delta > threshold ? 1 : delta < -threshold ? -1 : 0;
    const targetIdx = startIdx + dir;
    el.scrollTo({ left: targetIdx * w, behavior: "smooth" });
  };

  const current = slides[slide];

  return (
    <section className={`relative isolate rounded-xl shadow-sm overflow-hidden ${minHeight}`}>
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ext.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${s.image}-${i}`}
            src={s.image}
            alt=""
            draggable={false}
            className="min-w-full h-full object-cover snap-center select-none"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5 text-white">
        {sharedCaption ? (
          <>
            {sharedCaption.chip && (
              <span className="self-start inline-flex items-center gap-1.5 text-xs tracking-tight px-2.5 py-1 rounded-full border border-white/60">
                {sharedCaption.chip}
              </span>
            )}
            <div className="mt-3">{sharedCaption.title}</div>
            {sharedCaption.subtitle && (
              <div className="mt-1.5">{sharedCaption.subtitle}</div>
            )}
          </>
        ) : (
          <>
            {current?.chip && (
              <span className="self-start inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">
                {current.chip}
              </span>
            )}
            {current?.title && (
              <h2 className="mt-2 text-xl font-bold leading-tight">{current.title}</h2>
            )}
            {current?.subtitle && (
              <p className="mt-1 text-xs opacity-90">{current.subtitle}</p>
            )}
          </>
        )}
        <div className="pointer-events-auto mt-4 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className={`h-1 rounded-full transition-all ${
                i === slide ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
