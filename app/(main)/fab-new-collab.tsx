"use client";

import { Handshake } from "lucide-react";
import Link from "next/link";

export default function FabNewCollab() {
  return (
    <Link
      href="/collab"
      aria-label="새 제안 올리기"
      className="group fixed z-40 bottom-10 right-[calc(20vw-24px)] md:bottom-6 md:right-6 inline-flex items-center h-12 px-3.5 rounded-full bg-[#999f54] text-[#F2F0DC] shadow-lg hover:opacity-95 focus-visible:opacity-95 active:scale-95 transition-[padding,opacity,transform]"
    >
      <Handshake size={20} className="shrink-0" />
      <span className="overflow-hidden whitespace-nowrap max-w-0 ml-0 group-hover:max-w-[180px] group-hover:ml-2 group-focus:max-w-[180px] group-focus:ml-2 text-sm font-semibold transition-[max-width,margin] duration-300 ease-out">
        새 제안 올리기
      </span>
    </Link>
  );
}
