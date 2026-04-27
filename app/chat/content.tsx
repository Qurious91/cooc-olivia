"use client";

import { ArrowLeft, Send, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  type ChatMessageRow,
  loadChatMessages,
  markChatRead,
  sendChatMessage,
} from "../data/chats";
import { createClient } from "@/lib/supabase/client";

type RoomMeta = {
  id: string;
  collabId: string;
  collabTitle: string;
  authorId: string;
  applicantId: string;
  otherUserId: string;
  otherNickname: string;
  otherAvatarUrl: string | null;
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatContent() {
  const params = useSearchParams();
  const roomId = params.get("id");

  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomMeta | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoaded(true);
        return;
      }
      if (cancelled) return;
      setUserId(user.id);

      const { data: r } = await supabase
        .from("chat_rooms")
        .select(
          "id, collab_id, applicant_id, " +
            "collabs!chat_rooms_collab_id_fkey(id, title, author_id, " +
            "profiles!collabs_author_id_fkey(id, nickname, name, avatar_url)" +
            "), " +
            "applicant:profiles!chat_rooms_applicant_id_fkey(id, nickname, name, avatar_url)",
        )
        .eq("id", roomId)
        .maybeSingle();
      if (cancelled) return;
      if (!r) {
        setLoaded(true);
        return;
      }
      const data = r as any;
      const collab = data.collabs;
      const isAuthor = collab?.author_id === user.id;
      const other = isAuthor ? data.applicant : collab?.profiles;
      setRoom({
        id: data.id,
        collabId: collab?.id ?? data.collab_id,
        collabTitle: collab?.title ?? "",
        authorId: collab?.author_id ?? "",
        applicantId: data.applicant_id,
        otherUserId: other?.id ?? "",
        otherNickname:
          other?.nickname?.trim() || other?.name?.trim() || "익명",
        otherAvatarUrl: other?.avatar_url ?? null,
      });
      const msgs = await loadChatMessages(data.id);
      if (cancelled) return;
      setMessages(msgs);
      setLoaded(true);
      void markChatRead(data.id, user.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Realtime: 새 메시지 도착 시 리스트 갱신
  useEffect(() => {
    if (!roomId || !userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          void markChatRead(roomId, userId);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  // 메시지 추가될 때 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
    if (!room || !userId) return;
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const sent = await sendChatMessage(room.id, userId, text);
    setSending(false);
    if (sent) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } else {
      // 실패 시 입력 복원
      setDraft(text);
    }
  };

  if (!roomId || (loaded && !room)) {
    return (
      <div className="flex flex-col h-[100dvh] bg-surface">
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
    <div className="flex flex-col h-[100dvh] bg-surface">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-black/10 dark:border-white/10 shrink-0">
        <Link
          href="/messages"
          aria-label="뒤로"
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-1"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-9 h-9 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
            {room?.otherAvatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={room.otherAvatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={18} strokeWidth={1.75} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-text-1 truncate">
              {room?.otherNickname ?? ""}
            </div>
            {room?.collabTitle && (
              <div className="text-[11px] text-text-5 truncate">
                {room.collabTitle}
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 max-w-xl w-full mx-auto"
      >
        {!loaded && (
          <p className="text-xs text-text-5 text-center py-4">
            대화 불러오는 중...
          </p>
        )}
        {loaded && messages.length === 0 && (
          <p className="text-xs text-text-5 text-center py-8">
            아직 주고받은 메시지가 없어요. 먼저 인사를 건네보세요.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-2xl text-base whitespace-pre-wrap break-words ${
                    mine
                      ? "bg-[#999f54] text-[#F2F0DC] rounded-br-sm"
                      : "bg-black/5 dark:bg-white/5 text-text-1 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <div className="text-[10px] text-text-6 mt-1">
                  {fmtTime(m.created_at)}
                </div>
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
        className="bg-surface border-t border-black/10 dark:border-white/10 px-3 py-2.5 flex items-center gap-2 max-w-xl w-full mx-auto shrink-0"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="메시지 입력"
          className="flex-1 px-3 py-2 rounded-full bg-black/5 dark:bg-white/5 text-base text-text-1 placeholder:text-text-6 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="전송"
          disabled={!draft.trim() || sending}
          className="p-2 rounded-full bg-[#999f54] text-[#F2F0DC] disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
