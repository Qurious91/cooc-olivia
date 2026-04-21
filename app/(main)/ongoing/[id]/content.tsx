"use client";

import { ArrowLeft, CalendarClock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { type OngoingItem } from "../data";

export default function OngoingDetailContent({ item }: { item: OngoingItem }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="relative h-[40vh] w-full bg-black/5 dark:bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
        <Link
          href="/ongoing"
          aria-label="뒤로"
          className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="absolute top-4 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-black/55 text-[11px] text-white backdrop-blur-sm">
          {item.kind}
        </span>
      </div>

      <main className="flex-1 px-5 pt-5 pb-24 max-w-xl w-full mx-auto">
        <h1 className="text-xl font-bold text-text-1 leading-snug">
          {item.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-xs text-text-4">
          <Users size={14} className="shrink-0 text-[#999f54]" />
          <span className="truncate">{item.host}</span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-text-5">
          <span className="inline-flex items-center gap-2">
            <CalendarClock size={14} className="shrink-0" />
            <span>{item.period}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            <span>{item.location}</span>
          </span>
        </div>

        <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5">
          <h2 className="text-xs font-semibold text-text-4 mb-2">협업 소개</h2>
          <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
            {item.desc}
          </p>
        </div>
      </main>
    </div>
  );
}
