"use client";

import { Briefcase, Heart, Megaphone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FabNewCollab from "../fab-new-collab";
import ActiveWorks from "./active-works";
import CompletedWorks from "./completed-works";
import LikedList from "./liked-card";
import MyCollabs from "./my-collabs";

const TABS = [
  { key: "mine", label: "내가 올린 제안", Icon: Megaphone },
  { key: "active", label: "진행중", Icon: Briefcase },
  { key: "liked", label: "찜한 제안", Icon: Heart },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTab(v: string | null): v is TabKey {
  return v === "mine" || v === "active" || v === "liked";
}

export default function ProjectsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const openId = searchParams.get("open") ?? undefined;
  const [tab, setTab] = useState<TabKey>(isTab(queryTab) ? queryTab : "mine");

  useEffect(() => {
    if (isTab(queryTab)) setTab(queryTab);
  }, [queryTab]);

  return (
    <main className="flex-1 px-4 pt-6 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        <h1 className="text-xl font-bold text-text-1">프로젝트</h1>
        <p className="text-sm text-text-5 mt-1">찜한 제안과 진행 중인 협업을 한눈에</p>

        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 rounded-full bg-black/5">
          {TABS.map(({ key, label, Icon }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center justify-center gap-1 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#999f54] text-[#F2F0DC] shadow-sm"
                    : "bg-transparent text-text-6"
                }`}
              >
                <Icon
                  size={14}
                  className={key === "liked" ? "fill-red-500 text-red-500" : undefined}
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
            <MyCollabs initialOpenId={openId} />
          ) : (
            <ActiveWorks />
          )}
        </div>
        <CompletedWorks />
        <FabNewCollab />
    </main>
  );
}
