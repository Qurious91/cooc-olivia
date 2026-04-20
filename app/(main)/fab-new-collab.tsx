"use client";

import { Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function FabNewCollab() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isTouchRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    isTouchRef.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: PointerEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [expanded]);

  const onClick = () => {
    if (isTouchRef.current && !expanded) {
      setExpanded(true);
      return;
    }
    router.push("/collab");
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      aria-label="새 제안 올리기"
      aria-expanded={expanded}
      className="group fixed z-40 bottom-10 right-[calc(20vw-24px)] md:bottom-6 md:right-6 inline-flex items-center h-12 px-3.5 rounded-full bg-[#999f54] text-[#F2F0DC] shadow-lg hover:opacity-95 focus-visible:opacity-95 active:scale-95 transition-[padding,opacity,transform]"
    >
      <Handshake size={20} className="shrink-0" />
      <span
        className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width,margin] duration-300 ease-out group-hover:max-w-[180px] group-hover:ml-2 group-focus:max-w-[180px] group-focus:ml-2 ${
          expanded ? "max-w-[180px] ml-2" : "max-w-0 ml-0"
        }`}
      >
        새 제안 올리기
      </span>
    </button>
  );
}
