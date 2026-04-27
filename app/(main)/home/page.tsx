"use client";

import {
  ChefHat,
  Handshake,
  Store,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CREATOR_CATEGORIES, BRAND_CATEGORIES } from "../../data/categories";
import { createClient } from "@/lib/supabase/client";
import { OngoingCard } from "../ongoing/card";
import { ONGOING_DUMMY } from "../ongoing/data";
import HeroSlider, { type HeroSlide } from "./hero-slider";

const ICON_MAP: Record<string, LucideIcon> = {
  UserPlus,
  ChefHat,
  Store,
  Handshake,
};

type CollabKindRow = {
  key: string;
  label: string;
  position: number;
  icon: string;
};

const TABS = ["메인", "F&B 크리에이터", "브랜드"] as const;

const MAIN_SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=80",
    title: "",
  },
  {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    title: "",
  },
  {
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80",
    title: "",
  },
];

const CREATOR_SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=80",
    chip: "이달의 크리에이터",
    title: "박셰프 × 이파티시에",
    subtitle: "겨울 시즌 디저트 3종 · 매장 정규 메뉴 편입",
  },
  {
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
    chip: "주목할 협업",
    title: "정소믈리에 × 로컬 와이너리",
    subtitle: "컬래버 디너 2회 연속 전석 매진",
  },
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    chip: "Brand Spotlight",
    title: "한브랜드 × 플랜트베이스",
    subtitle: "런치 팝업 3일간 웨이팅 200+",
  },
];

const BRAND_SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    chip: "이달의 브랜드",
    title: "오리진 푸드컴퍼니",
    subtitle: "신제품 런칭 팝업 3주간 6만명 방문",
  },
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    chip: "주목할 캠페인",
    title: "그린마켓 × 로컬 농가",
    subtitle: "친환경 밀키트 시즌 매출 3배",
  },
  {
    image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1600&q=80",
    chip: "Partnership",
    title: "한식당가 × 글로벌 유통",
    subtitle: "해외 4개국 동시 런칭",
  },
];

export default function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("메인");
  const [collabKinds, setCollabKinds] = useState<CollabKindRow[]>([]);
  const ongoingRef = useRef<HTMLUListElement>(null);
  const ongoingDrag = useRef<{
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  } | null>(null);
  const ongoingJustDragged = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("collab_kinds")
        .select("key, label, position, icon")
        .order("position");
      if (data) setCollabKinds(data as CollabKindRow[]);
    })();
  }, []);

  const onOngoingPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    if (!ongoingRef.current) return;
    ongoingDrag.current = {
      startX: e.clientX,
      startScrollLeft: ongoingRef.current.scrollLeft,
      moved: false,
    };
    ongoingRef.current.setPointerCapture(e.pointerId);
  };

  const onOngoingPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!ongoingDrag.current || !ongoingRef.current) return;
    const dx = e.clientX - ongoingDrag.current.startX;
    if (Math.abs(dx) > 4) ongoingDrag.current.moved = true;
    ongoingRef.current.scrollLeft = ongoingDrag.current.startScrollLeft - dx;
  };

  const onOngoingPointerUp = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!ongoingDrag.current) return;
    if (ongoingDrag.current.moved) {
      ongoingJustDragged.current = true;
      setTimeout(() => {
        ongoingJustDragged.current = false;
      }, 50);
    }
    ongoingDrag.current = null;
    if (ongoingRef.current?.hasPointerCapture(e.pointerId)) {
      ongoingRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const onOngoingClickCapture = (e: React.MouseEvent<HTMLUListElement>) => {
    if (ongoingJustDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <div className="hidden flex gap-2 px-4 py-2 border-b border-black/5 dark:border-white/5 overflow-x-auto">
        {TABS.map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              tab === k
                ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                : "bg-surface text-text-4 border-black/15 dark:border-white/15"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <main className="px-4 pt-3 pb-24 min-[1100px]:pb-8">
        {tab === "메인" ? (
          <div className="space-y-3">
            <HeroSlider
              slides={MAIN_SLIDES}
              minHeight="min-h-64"
              sharedCaption={{
                chip: (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#808000]" />
                    F&B 협업 전문 플랫폼
                  </>
                ),
                title: (
                  <h2 className="text-3xl font-medium tracking-tight leading-tight">Cook, Connect, Collab.</h2>
                ),
                subtitle: (
                  <p className="text-sm text-white/85">요리하고, 연결하고, 함께 만든다.</p>
                ),
              }}
            />

            <section className="rounded-xl bg-surface p-5 shadow-sm border border-black/5 dark:border-white/5">
              <h3 className="text-base font-semibold text-text-1 mb-1">어떤 협업을 원하시나요?</h3>
              <p className="text-[10px] text-red-500 leading-snug mb-3">
                참여자를 모집 중인 협업을 모아보는 곳. 아래 버튼 클릭과 연결되는 페이지의 칩 선택 동작이 중복돼요.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {collabKinds.map((k) => {
                  const Icon = ICON_MAP[k.icon] ?? Handshake;
                  return (
                    <Link
                      key={k.key}
                      href={`/explore?kind=${encodeURIComponent(k.label)}`}
                      className="flex flex-col items-center justify-center gap-1 py-1 text-text-1 group"
                    >
                      <span className="flex items-center justify-center w-11 h-11 rounded-full group-hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25">
                        <Icon size={22} />
                      </span>
                      <span className="text-[11px]">{k.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl bg-surface p-5 shadow-sm border border-black/5 dark:border-white/5">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-text-1">현재 지원자가 많은 협업</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
                      제작중
                    </span>
                  </div>
                  <p className="text-[10px] text-red-500 leading-snug">
                    &lsquo;진행중인 협업&rsquo;에서 지원자 많은 것만 필터한 모음. 아래처럼 사진 카드로 노출하려면 협업 생성·노출 방식 조정이 필요해요.
                  </p>
                </div>
                <Link href="/ongoing" className="shrink-0 text-xs text-[#999f54] hover:text-[#7a7f43]">전체보기</Link>
              </div>
              <ul
                ref={ongoingRef}
                onPointerDown={onOngoingPointerDown}
                onPointerMove={onOngoingPointerMove}
                onPointerUp={onOngoingPointerUp}
                onPointerCancel={onOngoingPointerUp}
                onClickCapture={onOngoingClickCapture}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {ONGOING_DUMMY.map((it) => (
                  <OngoingCard
                    key={it.id}
                    item={it}
                    className="snap-start shrink-0 w-48"
                  />
                ))}
              </ul>
            </section>
          </div>
        ) : tab === "F&B 크리에이터" ? (
          <div className="space-y-3">
            <HeroSlider slides={CREATOR_SLIDES} minHeight="min-h-52" />

            <section className="rounded-xl bg-surface p-6 shadow-sm border border-black/5 dark:border-white/5">
              <div className="mb-3 flex justify-end">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
                  제작중
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {CREATOR_CATEGORIES.map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center justify-center gap-2 py-3 text-text-1 group"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full group-hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25">
                      <Icon size={28} />
                    </span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-3">
            <HeroSlider slides={BRAND_SLIDES} minHeight="min-h-52" />

            <section className="rounded-xl bg-surface p-6 shadow-sm border border-black/5 dark:border-white/5">
              <div className="mb-3 flex justify-end">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
                  제작중
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {BRAND_CATEGORIES.map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center justify-center gap-2 py-3 text-text-1 group"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full group-hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25">
                      <Icon size={28} />
                    </span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
