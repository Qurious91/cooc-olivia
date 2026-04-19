"use client";

import Link from "next/link";
import { useState } from "react";

import Splash from "../../splash";
import { HOME_CATEGORIES, CREATOR_CATEGORIES, BRAND_CATEGORIES } from "../../data/categories";
import HeroSlider, { type HeroSlide } from "./hero-slider";

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

  return (
    <>
      <Splash />
      <div className="flex gap-2 px-4 py-2 border-b border-black/5 overflow-x-auto">
        {TABS.map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              tab === k
                ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                : "bg-white text-text-4 border-black/15"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <main className="px-4 pt-3 pb-24 md:pb-8">
        {tab === "메인" ? (
          <div className="space-y-3">
            <HeroSlider
              slides={MAIN_SLIDES}
              minHeight="min-h-80"
              sharedCaption={{
                chip: (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#808000]" />
                    F&B 협업 전문 플랫폼
                  </>
                ),
                title: (
                  <h2 className="text-3xl font-bold leading-tight">Cook, Connect, Collab.</h2>
                ),
                subtitle: (
                  <p className="text-sm opacity-90">요리하고, 연결하고, 함께 만든다.</p>
                ),
              }}
            />

            <section className="rounded-xl bg-white px-4 py-3 shadow-sm border border-black/5">
              <h3 className="text-sm font-semibold text-text-1 mb-2">어떤 협업을 원하시나요?</h3>
              <div className="grid grid-cols-5 gap-2">
                {HOME_CATEGORIES.map(({ Icon, label }) => (
                  <Link
                    key={label}
                    href={`/explore?kind=${encodeURIComponent(label)}`}
                    className="flex flex-col items-center justify-center gap-1 py-1 text-text-1 group"
                  >
                    <span className="flex items-center justify-center w-11 h-11 rounded-full group-hover:bg-[#999f54]/15">
                      <Icon size={22} />
                    </span>
                    <span className="text-[11px]">{label}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm border border-black/5">
              <div className="flex items-end justify-between mb-3">
                <h3 className="text-base font-semibold text-text-1">진행중인 협업</h3>
                <button className="text-xs text-text-5">전체보기</button>
              </div>
              <ul className="divide-y divide-black/5">
                {[
                  { a: "박셰프", b: "이파티시에", title: "시즈널 디저트 코스 공동개발", tag: "진행중" },
                  { a: "김바리스타", b: "최소믈리에", title: "와인 페어링 시그니처 음료", tag: "모집중" },
                  { a: "정셰프", b: "한브랜드", title: "팝업 다이닝 3일간 콜라보", tag: "예정" },
                  { a: "오베이커", b: "유셰프", title: "브런치 메뉴 신규 라인업", tag: "마감임박" },
                ].map((c) => (
                  <li key={c.title} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        <span className="w-8 h-8 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs flex items-center justify-center border-2 border-white">
                          {c.a[0]}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs flex items-center justify-center border-2 border-white">
                          {c.b[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-1 truncate">{c.title}</div>
                        <div className="text-xs text-text-5 truncate">{c.a} × {c.b}</div>
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                      {c.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : tab === "F&B 크리에이터" ? (
          <div className="space-y-3">
            <HeroSlider slides={CREATOR_SLIDES} minHeight="min-h-52" />

            <section className="rounded-xl bg-white p-6 shadow-sm border border-black/5">
              <div className="grid grid-cols-4 gap-4">
                {CREATOR_CATEGORIES.map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center justify-center gap-2 py-3 text-text-1 group"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full group-hover:bg-[#999f54]/15">
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

            <section className="rounded-xl bg-white p-6 shadow-sm border border-black/5">
              <div className="grid grid-cols-4 gap-4">
                {BRAND_CATEGORIES.map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center justify-center gap-2 py-3 text-text-1 group"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full group-hover:bg-[#999f54]/15">
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
