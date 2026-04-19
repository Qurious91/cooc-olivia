"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { compressImage } from "./compress-image";

type Photo = { id: string; url: string };

const STORAGE_KEY = "cooc.profile.photos.v1";

function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPhotos(JSON.parse(raw) as Photo[]);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.warn("사진 저장 실패 (저장 용량 초과 가능):", e);
    }
  }, [photos, hydrated]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    const added: Photo[] = [];
    for (const f of Array.from(files)) {
      try {
        const url = await compressImage(f);
        added.push({ id: makeId(), url });
      } catch (err) {
        console.warn("사진 처리 실패:", f.name, err);
      }
    }
    setPhotos((prev) => [...prev, ...added]);
    e.target.value = "";
    setBusy(false);
  };

  const remove = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-black/10 bg-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label="사진 삭제"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="aspect-square rounded-lg border-2 border-dashed border-black/15 text-text-5 flex flex-col items-center justify-center gap-1 hover:bg-[#999f54]/10 hover:border-[#999f54]/40 disabled:opacity-50 disabled:cursor-wait"
        >
          <Plus size={20} />
          <span className="text-[11px]">{busy ? "처리중…" : "사진 추가"}</span>
        </button>
      </div>
    </div>
  );
}
