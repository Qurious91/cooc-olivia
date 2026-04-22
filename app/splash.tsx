"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "cooc.splash.v1";

export default function Splash() {
  const [phase, setPhase] = useState<"idle" | "enter" | "show" | "collapse" | "done">("idle");

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) {
      setPhase("done");
      return;
    }
    setPhase("enter");
    const raf = requestAnimationFrame(() => setPhase("show"));
    const t1 = setTimeout(() => setPhase("collapse"), 1500);
    const t2 = setTimeout(() => {
      setPhase("done");
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#999f54] text-[#F2F0DC] transition-opacity ${
        phase === "collapse" ? "opacity-0 duration-[1500ms]" : "opacity-100 duration-1000"
      }`}
    >
      <h1
        className={`text-8xl font-bold tracking-tight transition-all ease-in-out ${
          phase === "collapse" ? "duration-[1500ms]" : "duration-1000"
        } ${
          phase === "enter"
            ? "opacity-0 scale-95"
            : phase === "collapse"
            ? "tracking-[-0.5em] scale-50 opacity-0"
            : ""
        }`}
      >
        COOC
      </h1>
      <p
        className={`mt-4 text-sm tracking-[0.2em] transition-all ease-in-out ${
          phase === "collapse" ? "duration-[1500ms]" : "duration-1000"
        } ${
          phase === "enter"
            ? "opacity-0"
            : phase === "collapse"
            ? "tracking-normal opacity-0 scale-50"
            : ""
        }`}
      >
        CO-CREATION WITH OUR CHEFS
      </p>
    </div>
  );
}
