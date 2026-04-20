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
  Plus,
  Sparkles,
  User,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AvatarCropper from "./avatar-cropper";
import PhotoUpload from "./photo-upload";
import Modal from "../../modal";

type Career = { period: string; summary: string; detail: string };
type Menu = { partner: string; title: string; when: string };
type Award = { period: string; title: string };
type Contact = { kind: "ig" | "web" | "mail"; value: string };
type Stat = { n: string; l: string };

type SectionKey =
  | "career"
  | "awards"
  | "stats"
  | "menus"
  | "contacts"
  | "photos";

type ProfileData = {
  name: string;
  affiliation: string;
  position: string;
  region: string;
  avatar: string;
  keywords: string[];
  career: Career[];
  stats: Stat[];
  menus: Menu[];
  awards: Award[];
  contacts: Contact[];
  visible: SectionKey[];
};

const SECTION_ORDER: SectionKey[] = [
  "career",
  "awards",
  "stats",
  "menus",
  "contacts",
  "photos",
];

const SECTION_LABELS: Record<SectionKey, string> = {
  career: "경력",
  awards: "수상 내역",
  stats: "학력",
  menus: "시그니처 메뉴",
  contacts: "관심분야",
  photos: "사진",
};

const SECTION_HINTS: Record<SectionKey, string> = {
  career: "이전 경력",
  awards: "수상 이력",
  stats: "학력·자격",
  menus: "대표 메뉴",
  contacts: "연락처·관심분야",
  photos: "포트폴리오 사진",
};

const STORAGE_KEY = "cooc.profile.data.v12";

const DEMO_HEADER = {
  name: "데이비드 마르티네즈",
  affiliation: "엣지러너",
  position: "리더",
  location: "나이트시티",
} as const;

const DEFAULT_DATA: ProfileData = {
  name: DEMO_HEADER.name,
  affiliation: DEMO_HEADER.affiliation,
  position: DEMO_HEADER.position,
  region: DEMO_HEADER.location,
  avatar: "",
  keywords: ["시즈널", "한식 모던", "팝업", "협업 오픈"],
  career: [
    {
      period: "2020.03 ~ 2023.02",
      summary: "Mugunghwa · Sous Chef",
      detail: "코스 개발·소스 파트, 시즌 메뉴 3회 개편 주도.",
    },
    {
      period: "2018.06 ~ 2020.02",
      summary: "Le Jardin · Chef de Partie",
      detail: "그릴·해산물 섹션, 하루 80석 서비스 담당.",
    },
  ],
  stats: [
    { n: "2018.07", l: "Le Cordon Bleu Seoul" },
    { n: "2016.02", l: "서울 조리과학고" },
    { n: "2024.06", l: "Pastry Masterclass" },
  ],
  menus: [],
  awards: [
    { period: "2025.05", title: "Young Chef of the Year" },
    { period: "2024.09", title: "베스트 팝업 다이닝" },
    { period: "2023.11", title: "Rising Star" },
  ],
  contacts: [],
  visible: ["career", "awards", "stats"],
};

const INPUT_BASE =
  "bg-transparent border-b border-dashed border-[#999f54]/35 rounded-none outline-none pb-px transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54]";

const TEXTAREA_BASE =
  "bg-transparent border border-dashed border-[#999f54]/35 rounded-md px-3 py-2 outline-none transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54] focus:bg-[#999f54]/5";

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
      className={`${TEXTAREA_BASE} ${className} w-full resize-y`}
    />
  );
}

export default function Profile() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const isVisible = (k: SectionKey) => data.visible.includes(k);
  const availableSections = SECTION_ORDER.filter((k) => !isVisible(k));

  const addSection = (k: SectionKey) => {
    setData((d) => {
      if (d.visible.includes(k)) return d;
      const next: ProfileData = { ...d, visible: [...d.visible, k] };
      if (k === "career" && next.career.length === 0) {
        next.career = [{ period: "", summary: "", detail: "" }];
      } else if (k === "awards" && next.awards.length === 0) {
        next.awards = [{ period: "", title: "" }];
      } else if (k === "stats" && next.stats.length === 0) {
        next.stats = [{ n: "", l: "" }];
      } else if (k === "menus" && next.menus.length === 0) {
        next.menus = [{ partner: "", title: "", when: "" }];
      } else if (k === "contacts" && next.contacts.length === 0) {
        next.contacts = [{ kind: "ig", value: "" }];
      }
      return next;
    });
    if (availableSections.length <= 1) setPickerOpen(false);
  };

  const removeSection = (k: SectionKey) => {
    setData((d) => {
      const next: ProfileData = {
        ...d,
        visible: d.visible.filter((x) => x !== k),
      };
      if (k === "career") next.career = [];
      else if (k === "awards") next.awards = [];
      else if (k === "stats") next.stats = [];
      else if (k === "menus") next.menus = [];
      else if (k === "contacts") next.contacts = [];
      return next;
    });
  };

  const addKeyword = () => {
    const v = keywordDraft.trim();
    if (!v) return;
    setData((d) =>
      d.keywords.includes(v) ? d : { ...d, keywords: [...d.keywords, v] },
    );
    setKeywordDraft("");
  };

  const removeKeyword = (i: number) =>
    setData((d) => ({ ...d, keywords: d.keywords.filter((_, idx) => idx !== i) }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw) as Partial<ProfileData>;
        const merged = { ...DEFAULT_DATA, ...loaded };
        if (!Array.isArray(loaded.visible)) {
          const derived: SectionKey[] = [];
          if (merged.career.length) derived.push("career");
          if (merged.awards.length) derived.push("awards");
          if (merged.stats.length) derived.push("stats");
          if (merged.menus.length) derived.push("menus");
          if (merged.contacts.length) derived.push("contacts");
          merged.visible = derived;
        }
        setData(merged);
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

  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingAvatarFile(file);
  };

  const patchItem = <K extends "career" | "menus" | "awards" | "stats" | "contacts">(
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
    <>
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

        <section className="rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <div className="flex items-center gap-4">
          <div className="shrink-0">
            <button
              type="button"
              disabled={!editing}
              onClick={() => avatarInputRef.current?.click()}
              aria-label="프로필 사진 변경"
              className="relative w-16 h-16 rounded-full overflow-hidden bg-[#999f54] text-[#F2F0DC] flex items-center justify-center text-xl font-bold disabled:cursor-default"
            >
              {data.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={data.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} strokeWidth={1.75} />
              )}
              {editing && (
                <span className="absolute inset-0 bg-black/45 text-white flex items-center justify-center">
                  <Camera size={18} />
                </span>
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarPick}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-5">
            <TextField
              value={data.name}
              editing={editing}
              onChange={(v) => set("name", v)}
              className="text-2xl font-bold text-text-1"
            />
            <div className="flex items-baseline gap-1.5 text-sm text-text-3">
              <Briefcase size={14} className="text-[#999f54] shrink-0 self-center" />
              {editing ? (
                <div className="flex items-baseline gap-1 flex-1 min-w-0">
                  <TextField
                    value={data.affiliation}
                    editing={editing}
                    onChange={(v) => set("affiliation", v)}
                    placeholder="소속"
                    className="text-sm text-text-3 flex-1 min-w-0"
                  />
                  <span className="text-text-5 shrink-0">·</span>
                  <TextField
                    value={data.position}
                    editing={editing}
                    onChange={(v) => set("position", v)}
                    placeholder="직책"
                    className="text-sm text-text-3 flex-1 min-w-0"
                  />
                  <span className="text-text-6 shrink-0 text-xs">·</span>
                  <TextField
                    value={data.region}
                    editing={editing}
                    onChange={(v) => set("region", v)}
                    placeholder="위치"
                    className="text-xs text-text-6 flex-1 min-w-0"
                  />
                </div>
              ) : (
                <span className="truncate">
                  <span className="text-text-3">
                    {[data.affiliation, data.position].filter(Boolean).join(" · ")}
                  </span>
                  {data.region && (
                    <span className="text-xs text-text-6">
                      {[data.affiliation, data.position].filter(Boolean).length > 0 && " · "}
                      {data.region}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          </div>
          {(editing || data.keywords.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2 justify-start">
              {data.keywords.map((kw, i) => (
                <span
                  key={`${kw}-${i}`}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#999f54]/10 text-[#4a4d22]"
                >
                  {kw}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeKeyword(i)}
                      aria-label={`${kw} 삭제`}
                      className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-[#999f54]/20"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
              {editing && (
                <label className="inline-flex items-center gap-1 text-xs pl-2.5 pr-3 py-1.5 rounded-full border border-dashed border-[#999f54]/40 bg-transparent text-[#4a4d22] transition-colors hover:border-[#999f54]/70 focus-within:border-solid focus-within:border-[#999f54] focus-within:bg-[#999f54]/5">
                  <Plus size={12} className="text-[#999f54] shrink-0" />
                  <input
                    type="text"
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    onBlur={addKeyword}
                    placeholder="키워드 추가"
                    className="bg-transparent outline-none w-20 text-[#4a4d22] placeholder:text-[#999f54]/70"
                  />
                </label>
              )}
            </div>
          )}
        </section>

        {editing && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={availableSections.length === 0}
              className="inline-flex items-center gap-1 text-xs text-text-5 px-3 py-1.5 rounded-full border border-dashed border-black/20 hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> 항목 추가
            </button>
          </div>
        )}

        {isVisible("career") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <ChefHat size={16} className="text-[#999f54]" />
              경력
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("career")}
                  aria-label="경력 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <ul className="space-y-4 text-sm">
              {data.career.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <div className="shrink-0 w-32">
                    <TextField
                      value={c.period}
                      editing={editing}
                      onChange={(v) => patchItem("career", i, { period: v })}
                      placeholder="2020.03 ~ 2023.02"
                      className="text-xs text-text-6 tabular-nums block"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <TextField
                      value={c.summary}
                      editing={editing}
                      onChange={(v) => patchItem("career", i, { summary: v })}
                      placeholder="주요 내용"
                      className="text-text-1 block"
                    />
                    <TextArea
                      value={c.detail}
                      editing={editing}
                      onChange={(v) => patchItem("career", i, { detail: v })}
                      className="text-xs text-text-5 leading-relaxed"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isVisible("awards") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Medal size={16} className="text-[#999f54]" />
              수상 내역
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("awards")}
                  aria-label="수상 내역 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <ul className="space-y-3 text-sm">
              {data.awards.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <div className="shrink-0 w-32">
                    <TextField
                      value={a.period}
                      editing={editing}
                      onChange={(v) => patchItem("awards", i, { period: v })}
                      placeholder="2025.05"
                      className="text-xs text-text-6 tabular-nums block"
                    />
                  </div>
                  <TextField
                    value={a.title}
                    editing={editing}
                    onChange={(v) => patchItem("awards", i, { title: v })}
                    placeholder="상 이름"
                    className="text-text-1 font-semibold flex-1 min-w-0 block"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {isVisible("stats") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <GraduationCap size={16} className="text-[#999f54]" />
              학력
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("stats")}
                  aria-label="학력 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <ul className="space-y-3 text-sm">
              {data.stats.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="shrink-0 w-32">
                    <TextField
                      value={s.n}
                      editing={editing}
                      onChange={(v) => patchItem("stats", i, { n: v })}
                      placeholder="2018.07"
                      className="text-xs text-text-6 tabular-nums block"
                    />
                  </div>
                  <TextField
                    value={s.l}
                    editing={editing}
                    onChange={(v) => patchItem("stats", i, { l: v })}
                    placeholder="Le Cordon Bleu Seoul"
                    className="text-text-1 font-semibold flex-1 min-w-0 block"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {isVisible("menus") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Utensils size={16} className="text-[#999f54]" />
              시그니처 메뉴
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("menus")}
                  aria-label="시그니처 메뉴 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <ul className="divide-y divide-black/5">
              {data.menus.map((m, i) => (
                <li key={i} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center shrink-0">
                      <User size={16} strokeWidth={1.75} />
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
        )}

        {isVisible("contacts") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Sparkles size={16} className="text-[#999f54]" />
              관심분야
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("contacts")}
                  aria-label="관심분야 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
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
        )}

        {isVisible("photos") && (
          <section className="mt-2 rounded-xl border border-black/10 bg-white shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Camera size={16} className="text-[#999f54]" />
              사진
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("photos")}
                  aria-label="사진 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <PhotoUpload />
          </section>
        )}

      </main>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="항목 추가"
        size="sm"
      >
        {availableSections.length === 0 ? (
          <p className="text-xs text-text-5">추가할 수 있는 항목을 모두 추가했어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableSections.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => addSection(k)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-black/15 bg-white text-left hover:border-[#999f54] hover:bg-[#999f54]/5 transition-colors"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-text-5">
                  <Plus size={14} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-2">
                    {SECTION_LABELS[k]}
                  </span>
                  <span className="block text-[11px] text-text-6 truncate">
                    {SECTION_HINTS[k]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {pendingAvatarFile && (
        <AvatarCropper
          file={pendingAvatarFile}
          onCancel={() => setPendingAvatarFile(null)}
          onConfirm={(url) => {
            set("avatar", url);
            setPendingAvatarFile(null);
          }}
        />
      )}
    </>
  );
}
