"use client";

import { useState } from "react";

import BottomNav from "./bottom-nav";
import Modal from "./modal";
import SiteHeader from "./site-header";
import Splash from "./splash";
import { HOME_CATEGORIES, CREATOR_CATEGORIES } from "./data/categories";

const TABS = ["메인", "F&B 크리에이터", "브랜드"] as const;

export default function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("메인");
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <Splash />
      <div className="min-h-screen bg-white text-text-4">
        <SiteHeader />

        <div className="flex gap-2 px-4 py-3 border-b border-black/5 overflow-x-auto">
          {TABS.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${
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
              <section
                className="relative rounded-xl shadow-sm border border-black/5 overflow-hidden bg-cover bg-center min-h-72"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
                <div className="relative p-8 pt-40 text-white">
                  <span className="inline-block text-xs tracking-tight px-2.5 py-1 rounded-full border border-white/60">
                    F&B 협업 전문 플랫폼
                  </span>
                  <h2 className="mt-3 text-3xl font-bold">Cook, Connect, Collab.</h2>
                  <p className="mt-2 opacity-90">요리하고, 연결하고, 함께 만든다.</p>
                </div>
              </section>

              <section className="rounded-xl bg-white p-6 shadow-sm border border-black/5">
                <h3 className="text-base font-semibold text-text-1 mb-2">어떤 협업을 원하시나요?</h3>
                <div className="grid grid-cols-5 gap-4">
                  {HOME_CATEGORIES.map(({ Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => setSelected(label)}
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
          ) : (
            <section className="rounded-xl bg-white p-6 shadow-sm border border-black/5 min-h-40" />
          )}
        </main>

        <BottomNav />

        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={selected ?? ""}
          size="xl"
          fullHeight
        >
          <div className="h-full flex items-center justify-center text-text-5">
            상세 내용 준비중
          </div>
        </Modal>
      </div>
    </>
  );
}
