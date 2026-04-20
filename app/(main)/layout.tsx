"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";

const SCROLL_DELTA = 10;
const TRANSITION_MS = 500;

function useHideOnScrollDown(threshold = 80) {
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  hiddenRef.current = hidden;

  useEffect(() => {
    let lastY = window.scrollY;
    let lockUntil = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now < lockUntil) return;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < SCROLL_DELTA) return;
      if (dy > 0 && y > threshold && !hiddenRef.current) {
        setHidden(true);
        lockUntil = now + TRANSITION_MS;
      } else if (dy < 0 && hiddenRef.current) {
        setHidden(false);
        lockUntil = now + TRANSITION_MS;
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return hidden;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const hidden = useHideOnScrollDown();
  return (
    <div className="min-h-screen flex flex-col bg-white text-text-4">
      <div
        aria-hidden={hidden}
        className={`sticky top-0 z-50 bg-white will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <SiteHeader />
      </div>
      {children}
      <BottomNav />
    </div>
  );
}
