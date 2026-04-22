"use client";

import { MessageCircle, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type ChatRoom, deleteChat, loadChats } from "../../data/chats";

const REVEAL = 80;

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

function ChatRow({
  room,
  isOpen,
  onOpen,
  onClose,
  onDelete,
}: {
  room: ChatRoom;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [tx, setTx] = useState(isOpen ? -REVEAL : 0);
  const [animating, setAnimating] = useState(true);
  const drag = useRef<{
    x: number;
    y: number;
    base: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const justDragged = useRef(false);

  useEffect(() => {
    if (drag.current) return;
    setAnimating(true);
    setTx(isOpen ? -REVEAL : 0);
  }, [isOpen]);

  const handleDown = (e: React.PointerEvent) => {
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      base: isOpen ? -REVEAL : tx,
      axis: null,
    };
    setAnimating(false);
  };

  const handleMove = (e: React.PointerEvent) => {
    const s = drag.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.axis === null) {
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (s.axis !== "x") return;
    justDragged.current = true;
    setTx(Math.max(-REVEAL * 1.4, Math.min(0, s.base + dx)));
  };

  const handleUp = () => {
    const s = drag.current;
    drag.current = null;
    setAnimating(true);
    if (!s) return;
    if (s.axis === "x") {
      if (tx < -REVEAL / 2) {
        setTx(-REVEAL);
        onOpen();
      } else {
        setTx(0);
        onClose();
      }
      setTimeout(() => {
        justDragged.current = false;
      }, 50);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (justDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (isOpen) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <li data-chat-row={room.id} className="relative overflow-hidden">
      <button
        type="button"
        onClick={onDelete}
        aria-label="대화 삭제"
        className="absolute right-0 inset-y-0 w-20 flex flex-col items-center justify-center gap-0.5 bg-red-500 text-white text-[11px] font-semibold"
      >
        <Trash2 size={16} />
        삭제
      </button>
      <div
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        style={{
          transform: `translateX(${tx}px)`,
          transition: animating ? "transform 200ms" : "none",
          touchAction: "pan-y",
        }}
        className="relative bg-background"
      >
        <Link
          href={`/chat?id=${encodeURIComponent(room.id)}`}
          onClick={handleClick}
          draggable={false}
          className="flex items-center gap-3 px-4 py-3 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
        >
          <span className="w-12 h-12 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
            <User size={22} strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[15px] font-semibold text-text-1 truncate">
                {room.withName}
                {room.withRole && (
                  <span className="ml-1.5 text-[11px] font-normal text-text-6">
                    {room.withRole}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-text-6">{timeOf(room)}</span>
            </div>
            <div className="text-[13px] text-text-5 truncate mt-0.5">
              {previewOf(room)}
            </div>
          </div>
        </Link>
      </div>
    </li>
  );
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setRooms(loadChats());
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(`[data-chat-row="${openId}"]`)) {
        setOpenId(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openId]);

  const onDelete = (id: string) => {
    deleteChat(id);
    setRooms(loadChats());
    setOpenId(null);
  };

  return (
    <main className="flex-1 px-0 pt-6 pb-24 min-[1100px]:pb-8 max-w-2xl w-full mx-auto">
        <div className="px-4">
          <h1 className="text-xl font-bold text-text-1">메시지</h1>
          <p className="text-sm text-text-5 mt-1">수락한 참여자와 나눈 대화</p>
        </div>

        {rooms.length === 0 ? (
          <div className="mx-4 mt-8 p-8 text-center">
            <MessageCircle size={32} className="mx-auto text-text-6 mb-2" />
            <p className="text-sm text-text-4">아직 대화가 없어요.</p>
            <p className="text-xs text-text-6 mt-1">
              내가 올린 제안에서 참여자를 수락하면 대화가 시작돼요.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
            >
              내 제안 보러가기
            </Link>
          </div>
        ) : (
          <ul className="mt-2 border-y divide-y border-black/5 divide-black/5 dark:border-white/5 dark:divide-white/5">
            {rooms.map((r) => (
              <ChatRow
                key={r.id}
                room={r}
                isOpen={openId === r.id}
                onOpen={() => setOpenId(r.id)}
                onClose={() => setOpenId((cur) => (cur === r.id ? null : cur))}
                onDelete={() => onDelete(r.id)}
              />
            ))}
          </ul>
        )}
    </main>
  );
}
