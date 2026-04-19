"use client";

import { Calendar, Check, ChevronDown, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createChat } from "../data/chats";
import { type Collab, deleteCollab, loadCollabs } from "../data/collabs";

type Applicant = { name: string; role: string; message: string };

const APPLICANT_POOL: Applicant[] = [
  { name: "김도현", role: "파인다이닝 셰프 · 6년차", message: "시즈널 코스 R&D 경험 있습니다. 함께 하고 싶어요." },
  { name: "박유나", role: "파티시에 · 5년차", message: "디저트 파트로 합류 가능합니다. 포트폴리오 보내드릴게요." },
  { name: "이준혁", role: "바리스타 · 4년차", message: "음료 페어링 파트에 관심 있습니다." },
  { name: "최은서", role: "푸드 스타일리스트", message: "비주얼/플레이팅 쪽으로 도와드릴 수 있어요." },
  { name: "정서진", role: "소믈리에", message: "와인 리스트 큐레이션 도와드립니다." },
  { name: "한지우", role: "비건 셰프", message: "플랜트베이스 메뉴 구성 관심 있어요." },
  { name: "오세훈", role: "R&D 연구원", message: "푸드랩 출신입니다. 레시피 검증 단계에서 기여할 수 있어요." },
  { name: "윤다솜", role: "팝업 기획자", message: "팝업 운영/물류 쪽 경험 많습니다." },
];

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function pickApplicants(id: string): Applicant[] {
  const h = hashId(id);
  const count = (h % 3) + 1;
  const start = h % APPLICANT_POOL.length;
  return Array.from({ length: count }, (_, i) => APPLICANT_POOL[(start + i) % APPLICANT_POOL.length]);
}

export default function MyCollabs() {
  const router = useRouter();
  const [items, setItems] = useState<Collab[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [handled, setHandled] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(loadCollabs());
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onDelete = (id: string) => {
    deleteCollab(id);
    setItems(loadCollabs());
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const markHandled = (collabId: string, name: string) => {
    setHandled((prev) => {
      const next = new Set(prev);
      next.add(`${collabId}:${name}`);
      return next;
    });
  };

  const acceptApplicant = (
    collabId: string,
    applicant: Applicant,
    title: string,
  ) => {
    markHandled(collabId, applicant.name);
    const room = createChat({
      withName: applicant.name,
      withRole: applicant.role,
      sourceTitle: title,
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 bg-white shadow-sm p-6 text-center">
        <p className="text-xs text-text-5 mb-3">아직 올린 제안이 없어요.</p>
        <Link
          href="/collab"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
        >
          <Plus size={14} />
          올리기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/collab"
        className="mb-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
      >
        <Plus size={14} />
        새 제안 올리기
      </Link>
      <ul className="space-y-3">
      {items.map((c) => {
        const open = expanded.has(c.id);
        const applicants = pickApplicants(c.id).filter(
          (a) => !handled.has(`${c.id}:${a.name}`)
        );
        return (
          <li
            key={c.id}
            className="rounded-xl border border-[#999f54]/50 bg-white shadow-sm p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] text-text-5 flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54] text-[#F2F0DC]">
                    {c.kind}
                  </span>
                  <span className="truncate">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-text-1 truncate">
                  {c.title}
                </div>
                {applicants.length > 0 && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#4a4d22]">
                    <UserPlus size={12} />
                    {applicants.length}명이 참여를 원해요
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-expanded={open}
                aria-label={open ? "접기" : "자세히 보기"}
                className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-black/15 text-text-4"
              >
                {open ? "접기" : "보기"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {open && (
              <div className="mt-3 pt-3 border-t border-black/5 space-y-3">
                {c.desc ? (
                  <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                    {c.desc}
                  </p>
                ) : (
                  <p className="text-xs text-text-6">아직 설명이 비어 있어요.</p>
                )}

                <dl className="grid grid-cols-1 gap-1.5 text-[11px] text-text-5">
                  <Row Icon={Calendar} label="기간" value={c.period || "협의"} />
                  <Row Icon={Users} label="파트너" value={c.partner || "미정"} />
                </dl>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserPlus size={12} className="text-[#4a4d22]" />
                    <h4 className="text-xs font-semibold text-text-1">
                      참여 요청 {applicants.length}
                    </h4>
                  </div>
                  {applicants.length === 0 ? (
                    <p className="text-[11px] text-text-6">아직 참여 요청이 없어요.</p>
                  ) : (
                    <ul className="space-y-2">
                      {applicants.map((a) => (
                        <li
                          key={a.name}
                          className="rounded-lg bg-[#999f54]/8 border border-[#999f54]/20 p-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs flex items-center justify-center">
                              {a.name[0]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-text-1">{a.name}</div>
                              <div className="text-[11px] text-text-5">{a.role}</div>
                              <p className="mt-1 text-[11px] text-text-4">{a.message}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-1.5 justify-end">
                            <button
                              onClick={() => markHandled(c.id, a.name)}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-black/15 text-text-5"
                            >
                              <X size={12} />
                              거절
                            </button>
                            <button
                              onClick={() => acceptApplicant(c.id, a, c.title)}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-[#999f54] text-[#F2F0DC]"
                            >
                              <Check size={12} />
                              수락
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                    삭제
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
      </ul>
    </div>
  );
}

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="mt-0.5 text-text-6 shrink-0" />
      <span className="w-10 shrink-0 text-text-6">{label}</span>
      <span className="text-text-4">{value}</span>
    </div>
  );
}
