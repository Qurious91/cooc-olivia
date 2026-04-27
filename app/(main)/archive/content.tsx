"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { HOME_CATEGORIES } from "../../data/categories";
import { type CollabKind } from "../../data/collabs";
import { ArchiveCard } from "./card";
import { ARCHIVE_DUMMY } from "./data";
import MyArchive from "./my-archive";

const KINDS = HOME_CATEGORIES.map((c) => c.label) as CollabKind[];

function isKind(v: string | null): v is CollabKind {
  return !!v && (KINDS as string[]).includes(v);
}

// 가로 스크롤 + 마우스 드래그 핸들러 묶음. 두 캐러셀에서 같은 로직을 재사용.
function useDragScroll() {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef<{
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  } | null>(null);
  const justDragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    if (!ref.current) return;
    drag.current = {
      startX: e.clientX,
      startScrollLeft: ref.current.scrollLeft,
      moved: false,
    };
    ref.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current || !ref.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.startScrollLeft - dx;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current) return;
    if (drag.current.moved) {
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 50);
    }
    drag.current = null;
    if (ref.current?.hasPointerCapture(e.pointerId)) {
      ref.current.releasePointerCapture(e.pointerId);
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLUListElement>) => {
    if (justDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onClickCapture,
  };
}

export default function ArchiveContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kind");
  const [kind] = useState<CollabKind | "전체">(
    isKind(initial) ? initial : "전체",
  );
  const top = useDragScroll();
  const bottom = useDragScroll();

  const items = useMemo(
    () =>
      kind === "전체"
        ? ARCHIVE_DUMMY
        : ARCHIVE_DUMMY.filter((d) => d.kind === kind),
    [kind],
  );

  const carouselClass =
    "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mr-4 pl-4 pr-4 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface">
      <header className="sticky top-0 z-20 bg-surface border-b border-black/10 dark:border-white/10 flex items-center gap-1.5 px-3 py-1.5">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[13px] font-semibold text-text-1">협업 아카이브</h1>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[10px] text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
          제작중
        </span>
        <span className="text-[10px] text-red-500 truncate">
          1·2행은 레이아웃 시안용 더미, 3행이 실제 공개된 아카이브예요.
        </span>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 max-w-xl w-full mx-auto space-y-5">
        <p className="text-xs text-text-5">
          {kind} 아카이브 {items.length}건
        </p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">{kind} 아카이브가 비어있어요.</p>
          </div>
        ) : (
          <>
            {/* 상단: 길쭉한 카드, 화면에 약 2.5개 노출 */}
            <ul
              ref={top.ref}
              onPointerDown={top.onPointerDown}
              onPointerMove={top.onPointerMove}
              onPointerUp={top.onPointerUp}
              onPointerCancel={top.onPointerCancel}
              onClickCapture={top.onClickCapture}
              className={carouselClass}
            >
              {items.map((it) => (
                <ArchiveCard
                  key={`top-${it.id}`}
                  item={it}
                  className="snap-start shrink-0 w-32"
                  imageClassName="aspect-[3/4]"
                />
              ))}
            </ul>

            {/* 하단: 와이드 카드 1개 + 다음 카드 1/4 정도 노출 */}
            <ul
              ref={bottom.ref}
              onPointerDown={bottom.onPointerDown}
              onPointerMove={bottom.onPointerMove}
              onPointerUp={bottom.onPointerUp}
              onPointerCancel={bottom.onPointerCancel}
              onClickCapture={bottom.onClickCapture}
              className={carouselClass}
            >
              {items.map((it) => (
                <ArchiveCard
                  key={`bottom-${it.id}`}
                  item={it}
                  className="snap-start shrink-0 w-[78%]"
                  imageClassName="aspect-video"
                />
              ))}
            </ul>
          </>
        )}

        <MyArchive />
      </main>
    </div>
  );
}
