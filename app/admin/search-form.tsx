"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/admin?q=${encodeURIComponent(trimmed)}` : "/admin");
  };

  return (
    <form onSubmit={submit} className="relative max-w-md">
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="이름 또는 소속"
        className="w-full h-10 pl-9 pr-9 rounded-full bg-surface border border-black/10 dark:border-white/10 text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/admin");
          }}
          aria-label="지우기"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-text-6 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
