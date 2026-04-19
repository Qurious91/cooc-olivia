"use client";

import {
  AtSign,
  Briefcase,
  Camera,
  ChefHat,
  Check,
  Globe,
  GraduationCap,
  Mail,
  Medal,
  Pencil,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";
import PhotoUpload from "./photo-upload";

type Position = { title: string; org: string; when: string };
type Menu = { partner: string; title: string; when: string };
type Award = { title: string; org: string; year: string };
type Contact = { kind: "ig" | "web" | "mail"; value: string };
type Stat = { n: string; l: string };

type ProfileData = {
  name: string;
  role: string;
  tagline: string;
  current: Position[];
  tags: string[];
  about: string;
  stats: Stat[];
  menus: Menu[];
  awards: Award[];
  contacts: Contact[];
};

const STORAGE_KEY = "cooc.profile.data.v1";

const DEFAULT_DATA: ProfileData = {
  name: "박셰프",
  role: "F&B 크리에이터 · 서울",
  tagline: "함께 만드는 시즈널 다이닝",
  current: [
    { title: "Head Chef", org: "Restaurant ONUL · 서울 한남동", when: "2023 – 현재" },
    { title: "Menu Consultant", org: "COOC Studio", when: "2024 – 현재" },
    { title: "Pop-up Director", org: "Seasonal Tasting Series", when: "2025 – 현재" },
  ],
  tags: ["시즈널 다이닝", "파인다이닝", "한식 모던", "팝업 기획", "메뉴 컨설팅", "푸드 스타일링"],
  about:
    "제철 재료에서 출발해 한식의 미감을 현대적으로 재해석합니다. 셰프, 파티시에, 바리스타와의 경계 없는 협업으로 코스와 팝업을 기획해요. 재료와 지역 생산자를 이어 이야기로 만드는 작업을 가장 좋아합니다.",
  stats: [
    { n: "27", l: "완료한 협업" },
    { n: "12", l: "진행중" },
    { n: "4.9", l: "평균 평점" },
  ],
  menus: [
    { partner: "이파티시에", title: "시즈널 디저트 코스", when: "2026.02" },
    { partner: "최소믈리에", title: "와인 페어링 시그니처", when: "2025.11" },
    { partner: "한브랜드", title: "팝업 다이닝 3일", when: "2025.08" },
  ],
  awards: [
    { title: "Young Chef of the Year", org: "한국 미식 협회", year: "2025" },
    { title: "베스트 팝업 다이닝", org: "Seoul Food Week", year: "2024" },
    { title: "Rising Star", org: "COOC Awards", year: "2023" },
  ],
  contacts: [
    { kind: "ig", value: "@chef.park.onul" },
    { kind: "web", value: "onul-kitchen.com" },
    { kind: "mail", value: "park@onul.kitchen" },
  ],
};

const INPUT_BASE =
  "px-2 py-0.5 rounded border border-[#999f54]/40 bg-[#999f54]/5 outline-none focus:border-[#999f54] focus:bg-white";

function TextField({
  value,
  editing,
  onChange,
  className = "",
  placeholder,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (!editing) return <span className={className}>{value}</span>;
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_BASE} ${className} w-full`}
    />
  );
}

function TextArea({
  value,
  editing,
  onChange,
  className = "",
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
}) {
  if (!editing) return <p className={className}>{value}</p>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={`${INPUT_BASE} ${className} w-full resize-y`}
    />
  );
}

export default function Profile() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw) as Partial<ProfileData>;
        setData({ ...DEFAULT_DATA, ...loaded });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("프로필 저장 실패:", e);
    }
  }, [data, hydrated]);

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const patchItem = <K extends "current" | "menus" | "awards" | "stats" | "contacts">(
    key: K,
    i: number,
    patch: Partial<ProfileData[K][number]>,
  ) =>
    setData((d) => ({
      ...d,
      [key]: (d[key] as ProfileData[K]).map((it, idx) =>
        idx === i ? { ...it, ...patch } : it,
      ) as ProfileData[K],
    }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-4 pt-6 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
              editing
                ? "border-[#999f54] bg-[#999f54] text-[#F2F0DC]"
                : "border-black/15 text-text-1 hover:bg-[#999f54]/10"
            }`}
          >
            {editing ? <Check size={14} /> : <Pencil size={14} />}
            {editing ? "완료" : "수정"}
          </button>
        </div>

        <section className="flex items-center gap-4 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <div className="w-20 h-20 rounded-full bg-[#999f54] text-[#F2F0DC] flex items-center justify-center text-2xl font-bold shrink-0">
            {data.name.slice(0, 1) || "?"}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <TextField
              value={data.name}
              editing={editing}
              onChange={(v) => set("name", v)}
              className="text-xl font-bold text-text-1"
            />
            <TextField
              value={data.role}
              editing={editing}
              onChange={(v) => set("role", v)}
              className="text-sm text-text-5"
            />
            <TextField
              value={data.tagline}
              editing={editing}
              onChange={(v) => set("tagline", v)}
              className="text-xs text-text-6"
            />
          </div>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <Briefcase size={16} className="text-[#999f54]" />
            현재
          </h2>
          <ul className="space-y-3 text-sm">
            {data.current.map((p, i) => (
              <li key={i} className="flex justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <TextField
                    value={p.title}
                    editing={editing}
                    onChange={(v) => patchItem("current", i, { title: v })}
                    className="text-text-1 block"
                  />
                  <TextField
                    value={p.org}
                    editing={editing}
                    onChange={(v) => patchItem("current", i, { org: v })}
                    className="text-xs text-text-5 block"
                  />
                </div>
                <div className="shrink-0 text-xs text-text-6">
                  <TextField
                    value={p.when}
                    editing={editing}
                    onChange={(v) => patchItem("current", i, { when: v })}
                    className="w-24 text-right"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <ChefHat size={16} className="text-[#999f54]" />
            경력
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, i) =>
              editing ? (
                <input
                  key={i}
                  type="text"
                  value={tag}
                  onChange={(e) =>
                    set(
                      "tags",
                      data.tags.map((t, idx) => (idx === i ? e.target.value : t)),
                    )
                  }
                  className={`${INPUT_BASE} text-xs w-28`}
                />
              ) : (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#999f54]/10 text-[#4a4d22]"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <Trophy size={16} className="text-[#999f54]" />
            수상 및 이력
          </h2>
          <TextArea
            value={data.about}
            editing={editing}
            onChange={(v) => set("about", v)}
            className="text-sm text-text-4 leading-relaxed"
          />
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <GraduationCap size={16} className="text-[#999f54]" />
            학력
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {data.stats.map((s, i) => (
              <div key={i} className="py-2">
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={s.n}
                      onChange={(e) => patchItem("stats", i, { n: e.target.value })}
                      className={`${INPUT_BASE} text-xl font-bold text-[#999f54] w-full text-center`}
                    />
                    <input
                      type="text"
                      value={s.l}
                      onChange={(e) => patchItem("stats", i, { l: e.target.value })}
                      className={`${INPUT_BASE} mt-1 text-xs w-full text-center`}
                    />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#999f54]">{s.n}</div>
                    <div className="mt-1 text-xs text-text-5">{s.l}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <div className="flex items-end justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1">
              <Utensils size={16} className="text-[#999f54]" />
              시그니처 메뉴
            </h2>
            {!editing && <button className="text-xs text-text-5">전체보기</button>}
          </div>
          <ul className="divide-y divide-black/5">
            {data.menus.map((m, i) => (
              <li key={i} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs flex items-center justify-center shrink-0">
                    {m.partner.slice(0, 1) || "?"}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <TextField
                      value={m.title}
                      editing={editing}
                      onChange={(v) => patchItem("menus", i, { title: v })}
                      className="text-sm text-text-1 block"
                    />
                    {editing ? (
                      <input
                        type="text"
                        value={m.partner}
                        onChange={(e) => patchItem("menus", i, { partner: e.target.value })}
                        placeholder="파트너"
                        className={`${INPUT_BASE} text-xs w-full`}
                      />
                    ) : (
                      <div className="text-xs text-text-5 truncate">with {m.partner}</div>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-text-6">
                  <TextField
                    value={m.when}
                    editing={editing}
                    onChange={(v) => patchItem("menus", i, { when: v })}
                    className="w-20 text-right"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <Medal size={16} className="text-[#999f54]" />
            수상 내역
          </h2>
          <ul className="space-y-3 text-sm">
            {data.awards.map((a, i) => (
              <li key={i} className="flex justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <TextField
                    value={a.title}
                    editing={editing}
                    onChange={(v) => patchItem("awards", i, { title: v })}
                    className="text-text-1 block"
                  />
                  <TextField
                    value={a.org}
                    editing={editing}
                    onChange={(v) => patchItem("awards", i, { org: v })}
                    className="text-xs text-text-5 block"
                  />
                </div>
                <div className="shrink-0 text-xs text-text-6">
                  <TextField
                    value={a.year}
                    editing={editing}
                    onChange={(v) => patchItem("awards", i, { year: v })}
                    className="w-16 text-right"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <Sparkles size={16} className="text-[#999f54]" />
            관심분야
          </h2>
          <ul className="space-y-3 text-sm">
            {data.contacts.map((c, i) => {
              const Icon = c.kind === "ig" ? AtSign : c.kind === "web" ? Globe : Mail;
              return (
                <li key={i} className="flex items-center gap-3">
                  <Icon size={18} className="text-text-5 shrink-0" />
                  <TextField
                    value={c.value}
                    editing={editing}
                    onChange={(v) => patchItem("contacts", i, { value: v })}
                    className="text-text-1 flex-1"
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
            <Camera size={16} className="text-[#999f54]" />
            사진
          </h2>
          <PhotoUpload />
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
