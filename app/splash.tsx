"use client";

import { useEffect, useState } from "react";

export default function Splash() {
  const [phase, setPhase] = useState<"init" | "show" | "collapse" | "done">("init");

  useEffect(() => {
    if (sessionStorage.getItem("splashed")) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("splashed", "1");
    setPhase("show");
    const t1 = setTimeout(() => setPhase("collapse"), 1400);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "done" || phase === "init") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#999f54] text-[#F2F0DC] transition-opacity duration-700 ${
        phase === "collapse" ? "opacity-0" : "opacity-100"
      }`}
    >
      <h1
        className={`text-8xl font-bold tracking-tight transition-all duration-[1500ms] ease-in-out ${
          phase === "collapse" ? "tracking-[-0.5em] scale-50 opacity-0" : ""
        }`}
      >
        COOC
      </h1>
      <p
        className={`mt-4 text-sm tracking-[0.2em] transition-all duration-[1500ms] ease-in-out ${
          phase === "collapse" ? "tracking-normal opacity-0 scale-50" : ""
        }`}
      >
        CO-CREATION WITH OUR CHEFS
      </p>
    </div>
  );
}
