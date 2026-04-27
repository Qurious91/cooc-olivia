"use client";

import { MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadMyChatRooms, type ChatRoomListItem } from "../../data/chats";
import { createClient } from "@/lib/supabase/client";

function timeOf(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
      const list = await loadMyChatRooms(user.id);
      if (cancelled) return;
      setRooms(list);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: 새 메시지가 오면 룸 리스트 갱신
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`my-chat-rooms:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        async () => {
          const list = await loadMyChatRooms(userId);
          setRooms(list);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
        },
        async () => {
          const list = await loadMyChatRooms(userId);
          setRooms(list);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <main className="flex-1 px-0 pt-6 pb-24 min-[1100px]:pb-8 max-w-2xl w-full mx-auto">
      <div className="px-4">
        <h1 className="text-xl font-bold text-text-1">메시지</h1>
        <p className="text-sm text-text-5 mt-1">수락한 참여자와 나눈 대화</p>
        <p className="text-[10px] text-red-500 leading-snug mt-1">
          협업이 생성되고 참여자가 있을 때 협업 생성자만 대화를 시작할 수 있어요. 한 번 시작된 대화는 협업이 종료·삭제되거나 참여가 거절돼도 그대로 유지돼요.
        </p>
      </div>

      {loaded && rooms.length === 0 ? (
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
        <ul className="mt-2 border-y divide-y border-black/15 divide-black/15 dark:border-white/5 dark:divide-white/5">
          {rooms.map((r) => (
            <li key={r.id} className="relative min-h-[68px]">
              <Link
                href={`/chat?id=${encodeURIComponent(r.id)}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
              >
                <span className="w-12 h-12 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                  {r.otherAvatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.otherAvatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={22} strokeWidth={1.75} />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  {r.collabTitle && (
                    <div className="text-[11px] text-text-5 truncate">
                      {r.collabTitle}
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-[15px] font-semibold text-text-1 truncate">
                      {r.otherNickname}
                    </div>
                    <span className="shrink-0 text-[11px] text-text-6">
                      {timeOf(r.lastMessageAt)}
                    </span>
                  </div>
                  <div className="text-[13px] text-text-5 truncate mt-0.5">
                    {r.lastMessage ?? "아직 메시지가 없어요"}
                  </div>
                </div>
                {r.unreadCount > 0 && (
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                    {r.unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
