"use client";

import { Briefcase, Heart, Megaphone } from "lucide-react";
import { useState } from "react";
import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";
import LikedList from "./liked-card";
import MyCollabs from "./my-collabs";

const WORKS = [
  {
    title: "시즈널 디저트 코스 공동개발",
    partner: "이파티시에",
    status: "진행중",
    progress: 70,
    due: "2026-05-02",
  },
  {
    title: "와인 페어링 시그니처 음료",
    partner: "최소믈리에",
    status: "리뷰",
    progress: 45,
    due: "2026-04-28",
  },
  {
    title: "팝업 다이닝 3일간 콜라보",
    partner: "한브랜드",
    status: "기획",
    progress: 20,
    due: "2026-06-10",
  },
  {
    title: "브런치 메뉴 신규 라인업",
    partner: "오베이커",
    status: "마감임박",
    progress: 90,
    due: "2026-04-20",
  },
];

const TABS = [
  { key: "mine", label: "내가 올린 제안", Icon: Megaphone },
  { key: "active", label: "진행중", Icon: Briefcase },
  { key: "liked", label: "찜한 제안", Icon: Heart },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Works() {
  const [tab, setTab] = useState<TabKey>("mine");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-4 pt-6 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        <h1 className="text-xl font-bold text-text-1">프로젝트</h1>
        <p className="text-sm text-text-5 mt-1">찜한 제안과 진행 중인 협업을 한눈에</p>

        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/5">
          {TABS.map(({ key, label, Icon }) => {
            const active = key === tab;
            const isHeart = key === "liked";
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-zinc-600 text-white shadow-sm"
                    : "bg-transparent text-text-6"
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isHeart
                      ? "fill-red-500 text-red-500"
                      : active
                        ? "text-white"
                        : "text-text-6"
                  }
                />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {tab === "liked" ? (
            <LikedList />
          ) : tab === "mine" ? (
            <MyCollabs />
          ) : (
            <ul className="space-y-3">
              {WORKS.map((w) => (
                <li
                  key={w.title}
                  className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-1 truncate">{w.title}</div>
                      <div className="text-xs text-text-5 mt-0.5">with {w.partner}</div>
                    </div>
                    <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                      {w.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#999f54]"
                        style={{ width: `${w.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-6">{w.progress}%</span>
                  </div>

                  <div className="mt-2 text-[11px] text-text-6">마감 {w.due}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
