"use client";

import { ArrowLeft, Send, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  type ChatMessage,
  type ChatRoom,
  appendMessage,
  getChat,
  makeMessageId,
} from "../data/chats";

function nowTime(t: number) {
  return new Date(t).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setRoom(getChat(id));
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [room]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const onInputFocus = () => {
    setTimeout(scrollToBottom, 300);
  };

  const send = () => {
    if (!room) return;
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: makeMessageId(),
      from: "me",
      text,
      time: Date.now(),
    };
    appendMessage(room.id, msg);
    setRoom({ ...room, messages: [...room.messages, msg] });
    setDraft("");
  };

  if (!id || !room) {
    return (
      <div className="flex flex-col h-[100dvh] bg-white">
        <main className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm text-text-5">대화를 찾을 수 없어요.</p>
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
            >
              메시지 목록으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-black/10 shrink-0">
        <Link
          href="/messages"
          aria-label="뒤로"
          className="p-1.5 rounded-full hover:bg-black/5 text-text-1"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
            <User size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex items-baseline gap-2">
            <div className="text-base font-semibold text-text-1 truncate">{room.withName}</div>
            {room.withRole && (
              <div className="text-xs text-text-5 truncate">{room.withRole}</div>
            )}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 max-w-xl w-full mx-auto"
      >
        {room.messages.map((m) => {
          if (m.from === "system") {
            return (
              <div key={m.id} className="text-center">
                <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                  {m.text}
                </span>
              </div>
            );
          }
          const mine = m.from === "me";
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-2xl text-base ${
                    mine
                      ? "bg-[#999f54] text-[#F2F0DC] rounded-br-sm"
                      : "bg-black/5 text-text-1 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <div className="text-[10px] text-text-6 mt-1">{nowTime(m.time)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="bg-white border-t border-black/10 px-3 py-2.5 flex items-center gap-2 max-w-xl w-full mx-auto shrink-0"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={onInputFocus}
          placeholder="메시지 입력"
          className="flex-1 px-3 py-2 rounded-full bg-black/5 text-base text-text-1 placeholder:text-text-6 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="전송"
          disabled={!draft.trim()}
          className="p-2 rounded-full bg-[#999f54] text-[#F2F0DC] disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
