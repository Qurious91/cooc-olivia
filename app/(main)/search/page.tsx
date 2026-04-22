"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";

const SCOPES = ["전체", "크리에이터", "브랜드", "협업"] as const;
type Scope = (typeof SCOPES)[number];

export default function Search() {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("전체");

  return (
    <main className="flex-1 flex flex-col px-4 pt-3 pb-24 min-[1100px]:pb-8">
      <div className="relative">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none"
        />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="크리에이터, 브랜드, 협업 검색"
          className="w-full h-11 pl-9 pr-9 rounded-full bg-surface border border-black/10 dark:border-white/10 text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="지우기"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-text-6 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SCOPES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              scope === s
                ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                : "bg-surface text-text-4 border-black/15 dark:border-white/15"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#999f54]/10 text-[#999f54] mb-3">
          <SearchIcon size={22} strokeWidth={1.75} />
        </span>
        {q ? (
          <>
            <p className="text-sm text-text-2">검색 결과가 없어요</p>
            <p className="mt-1 text-xs text-text-6">다른 키워드로 시도해 보세요</p>
          </>
        ) : (
          <>
            <p className="text-sm text-text-2">무엇을 찾고 있나요?</p>
            <p className="mt-1 text-xs text-text-6 leading-relaxed">
              이름·소속·키워드로
              <br />
              크리에이터와 브랜드, 협업을 찾아볼 수 있어요
            </p>
          </>
        )}
        <span className="mt-4 inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
          제작중
        </span>
      </div>
    </main>
  );
}
