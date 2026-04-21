"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomNav from "../bottom-nav";
import SideNav from "../side-nav";
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
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (y <= threshold) {
        if (hiddenRef.current) setHidden(false);
        return;
      }
      if (Math.abs(dy) < SCROLL_DELTA) return;
      if (dy < 0 && hiddenRef.current) {
        setHidden(false);
        return;
      }
      if (dy > 0 && !hiddenRef.current && now >= lockUntil) {
        setHidden(true);
        lockUntil = now + TRANSITION_MS;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return hidden;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const hidden = useHideOnScrollDown();
  const pathname = usePathname();
  const hideHeader = /^\/ongoing\/[^/]+$/.test(pathname ?? "");
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-4 min-[1100px]:pl-56">
      <SideNav />
      {!hideHeader && (
        <div
          aria-hidden={hidden}
          className={`sticky top-0 z-40 bg-background will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] min-[1100px]:hidden ${
            hidden ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <SiteHeader />
        </div>
      )}
      {children}
      <BottomNav />
    </div>
  );
}
