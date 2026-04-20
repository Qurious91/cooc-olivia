"use client";

import { Briefcase, ChevronDown, MessageCircle, Sparkles, Trash2, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import { type Applicant, displayApplicantName, pickApplicants } from "../../data/applicants";
import { createChat, createCoocChat } from "../../data/chats";
import { type Collab, collabHostLabel, deleteCollab, loadCollabs } from "../../data/collabs";

export default function MyCollabs({ initialOpenId }: { initialOpenId?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Collab[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(
    initialOpenId ? new Set([initialOpenId]) : new Set(),
  );
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [pendingDelegate, setPendingDelegate] = useState<{
    collab: Collab;
    applicants: Applicant[];
  } | null>(null);

  useEffect(() => {
    setItems(loadCollabs());
  }, []);

  useEffect(() => {
    if (!initialOpenId) return;
    setExpanded((prev) => {
      if (prev.has(initialOpenId)) return prev;
      const next = new Set(prev);
      next.add(initialOpenId);
      return next;
    });
    requestAnimationFrame(() => {
      document
        .getElementById(`collab-${initialOpenId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [initialOpenId]);

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

  const delegateToCooc = (c: Collab, pending: Applicant[]) => {
    setHandled((prev) => {
      const next = new Set(prev);
      pending.forEach((a) => next.add(`${c.id}:${a.name}`));
      return next;
    });
    const room = createCoocChat({
      collab: {
        title: c.title,
        kind: c.kind,
        desc: c.desc,
        partner: c.partner,
        period: c.period,
      },
      applicantNames: pending.map((a) => displayApplicantName(a)),
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  const acceptApplicant = (
    collabId: string,
    applicant: Applicant,
    title: string,
  ) => {
    markHandled(collabId, applicant.name);
    const room = createChat({
      withName: displayApplicantName(applicant),
      withRole: applicant.position,
      sourceTitle: title,
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 bg-white shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          아직 올린 제안이 없어요. 우측 하단의 “새 제안 올리기”로 시작해보세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {items.map((c) => {
          const open = expanded.has(c.id);
          const applicants = pickApplicants(c.id).filter(
            (a) => !handled.has(`${c.id}:${a.name}`),
          );
          const host = collabHostLabel(c);
          return (
            <li
              key={c.id}
              id={`collab-${c.id}`}
              className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-5 flex items-center gap-1.5">
                    <span className="truncate">{host}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[11px] text-[#4a4d22]">
                      {c.kind}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                    {c.title}
                  </div>
                </div>
                {applicants.length > 0 && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] border border-[#999f54]/30">
                    <UserPlus size={11} />
                    {applicants.length}
                  </span>
                )}
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => toggle(c.id)}
                  aria-expanded={open}
                  aria-label={open ? "접기" : "자세히"}
                  className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22]"
                >
                  자세히
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

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <UserPlus size={12} className="text-[#4a4d22]" />
                        <h4 className="text-xs font-semibold text-text-1">
                          참여 요청 {applicants.length}
                        </h4>
                      </div>
                      {applicants.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPendingDelegate({ collab: c, applicants })}
                          className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-[#999f54]/10 text-[#4a4d22] border border-[#999f54]/30 font-semibold hover:bg-[#999f54]/15"
                        >
                          <Sparkles size={11} />
                          COOC에게 맡기기
                        </button>
                      )}
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
                              <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                                <User size={16} strokeWidth={1.75} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-text-1">
                                  {displayApplicantName(a)}
                                </div>
                                <div className="mt-0.5 flex items-baseline gap-1 text-[11px] text-text-5">
                                  <Briefcase size={11} className="text-[#999f54] shrink-0 self-center" />
                                  <span className="truncate">
                                    {[a.affiliation, a.position, a.location].filter(Boolean).join(" · ")}
                                  </span>
                                </div>
                                <p className="mt-1.5 text-[11px] text-text-4">{a.message}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2 items-center justify-end">
                              <button
                                onClick={() => markHandled(c.id, a.name)}
                                className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-full border border-transparent underline text-text-6 hover:text-text-4 font-semibold"
                              >
                                다음 기회에
                              </button>
                              <button
                                onClick={() => acceptApplicant(c.id, a, c.title)}
                                className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-transparent bg-[#999f54] text-[#F2F0DC] hover:opacity-90 font-semibold"
                              >
                                <MessageCircle size={12} />
                                대화 시작하기
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

      <Modal
        open={!!pendingDelegate}
        onClose={() => setPendingDelegate(null)}
        title="COOC에게 맡기기"
        size="sm"
      >
        {pendingDelegate && (
          <div className="flex flex-col gap-5">
            <div className="text-sm text-text-3 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-text-1">{pendingDelegate.collab.title}</span>
                에 들어온 참여 요청 {pendingDelegate.applicants.length}건을 COOC 에이전시에
                위임합니다.
              </p>
              <p className="text-xs text-text-5">
                이후 매칭·조율은 COOC 채팅으로 이어져요.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDelegate(null)}
                className="flex-1 py-2.5 rounded-lg border border-black/15 text-sm text-text-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = pendingDelegate;
                  setPendingDelegate(null);
                  delegateToCooc(p.collab, p.applicants);
                }}
                className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                맡기기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
