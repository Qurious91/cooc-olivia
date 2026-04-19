"use client";

import { MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";
import { type ChatRoom, deleteChat, loadChats } from "../data/chats";

function previewOf(room: ChatRoom) {
  const nonSystem = [...room.messages].reverse().find((m) => m.from !== "system");
  return nonSystem?.text ?? "";
}

function timeOf(room: ChatRoom) {
  const last = room.messages[room.messages.length - 1];
  const t = last ? last.time : room.createdAt;
  const d = new Date(t);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    setRooms(loadChats());
  }, []);

  const onDelete = (id: string) => {
    deleteChat(id);
    setRooms(loadChats());
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-0 pt-4 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        <div className="px-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-text-1">메시지</h1>
          <Link
            href="/works"
            className="shrink-0 text-xs font-medium text-[#4a4d22] underline underline-offset-2"
          >
            내 제안 보러가기&gt;
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="mx-4 mt-8 p-8 text-center">
            <MessageCircle size={32} className="mx-auto text-text-6 mb-2" />
            <p className="text-sm text-text-4">아직 대화가 없어요.</p>
            <p className="text-xs text-text-6 mt-1">
              내가 올린 제안에서 참여자를 수락하면 대화가 시작돼요.
            </p>
            <Link
              href="/works"
              className="mt-4 inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
            >
              내 제안 보러가기
            </Link>
          </div>
        ) : (
          <ul className="mt-2">
            {rooms.map((r) => (
              <li key={r.id} className="group relative">
                <Link
                  href={`/chat?id=${encodeURIComponent(r.id)}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-black/5 hover:bg-black/[0.02]"
                >
                  <span className="w-12 h-12 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] text-base font-semibold flex items-center justify-center">
                    {r.withName[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[15px] font-semibold text-text-1 truncate">
                        {r.withName}
                        {r.withRole && (
                          <span className="ml-1.5 text-[11px] font-normal text-text-6">
                            · {r.withRole}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] text-text-6">{timeOf(r)}</span>
                    </div>
                    <div className="text-[13px] text-text-5 truncate mt-0.5">
                      {previewOf(r)}
                    </div>
                    {r.sourceTitle && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#4a4d22] bg-[#999f54]/10 px-1.5 py-0.5 rounded">
                        {r.sourceTitle}
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => onDelete(r.id)}
                  aria-label="대화 삭제"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-text-6 bg-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
