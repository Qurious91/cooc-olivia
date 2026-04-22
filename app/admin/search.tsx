"use client";

import { Handshake, Search as SearchIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileHit = { id: string; name: string | null };
type CollabHit = { id: string; title: string; authorName: string | null };
type CollabRaw = {
  id: string;
  title: string;
  profiles: { name: string | null } | null;
};

export default function AdminSearch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [profiles, setProfiles] = useState<ProfileHit[]>([]);
  const [collabs, setCollabs] = useState<CollabHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setQ("");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setProfiles([]);
      setCollabs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const supabase = createClient();
      const like = `%${trimmed}%`;
      const collabSelect =
        "id, title, profiles!collabs_author_id_fkey!inner(name)";
      const [pRes, cTitleRes, cAuthorRes] = await Promise.all([
        supabase.from("profiles").select("id, name").ilike("name", like).limit(5),
        supabase.from("collabs").select(collabSelect).ilike("title", like).limit(5),
        supabase.from("collabs").select(collabSelect).ilike("profiles.name", like).limit(5),
      ]);

      const merged = new Map<string, CollabHit>();
      const add = (rows: unknown) => {
        for (const row of (rows as CollabRaw[] | null) ?? []) {
          if (merged.has(row.id)) continue;
          merged.set(row.id, {
            id: row.id,
            title: row.title,
            authorName: row.profiles?.name ?? null,
          });
        }
      };
      add(cTitleRes.data);
      add(cAuthorRes.data);

      setProfiles((pRes.data ?? []) as ProfileHit[]);
      setCollabs(Array.from(merged.values()).slice(0, 8));
      setLoading(false);
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  const hasQuery = q.trim().length > 0;
  const showResults = open && hasQuery;
  const empty = !loading && hasQuery && profiles.length === 0 && collabs.length === 0;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="사용자·협업제목 검색"
        className="w-full h-10 pl-9 pr-3 rounded-full bg-surface border border-black/10 dark:border-white/10 text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]"
      />
      {showResults && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-xl bg-surface border border-black/10 dark:border-white/10 shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-xs text-text-6">검색 중…</div>
          )}
          {!loading && profiles.length > 0 && (
            <div className="py-1">
              <div className="px-4 py-1.5 text-[11px] font-medium text-text-6">사용자</div>
              {profiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/profiles/${p.id}`}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <User size={14} className="text-text-6 shrink-0" />
                  <span className="text-sm text-text-1 truncate">
                    {p.name || <span className="text-text-6">(이름 없음)</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {!loading && collabs.length > 0 && (
            <div className="py-1 border-t border-black/5 dark:border-white/5">
              <div className="px-4 py-1.5 text-[11px] font-medium text-text-6">협업</div>
              {collabs.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/collabs/${c.id}`}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 min-w-0"
                >
                  <Handshake size={14} className="text-text-6 shrink-0" />
                  <span className="text-sm text-text-1 truncate flex-1 min-w-0">{c.title}</span>
                  {c.authorName && (
                    <span className="text-xs text-text-6 shrink-0 truncate max-w-[40%]">
                      {c.authorName}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
          {empty && (
            <div className="px-4 py-3 text-xs text-text-6">검색 결과가 없어요</div>
          )}
        </div>
      )}
    </div>
  );
}
