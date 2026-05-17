"use client";

import { ArrowLeft, ImagePlus, Send, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import {
  type ChatMessageRow,
  loadChatMessages,
  markChatRead,
  sendChatImageMessage,
  sendChatMessage,
  signChatImagePath,
  uploadChatImage,
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

// 압축된 이미지의 실제 픽셀 크기 — 말풍선 레이아웃 시프트 방지용.
function readImageSize(
  file: Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
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
          const append = (msg: ChatMessageRow) =>
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
            );
          if (newMsg.image_path) {
            void signChatImagePath(newMsg.image_path).then((url) =>
              append({ ...newMsg, image_url: url }),
            );
          } else {
            append(newMsg);
          }
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

  // Android에서 키보드가 올라오면 visualViewport가 줄어듦.
  // 그 시점에 최신 메시지가 입력창에 가려지지 않도록 강제로 스크롤 맨 아래로.
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    // 키보드가 올라온 후 레이아웃이 안정화될 때까지 기다렸다가 스크롤
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 250);
    });
  };

  const onPickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file || !room || !userId || sending) return;
    if (!file.type.startsWith("image/")) return;
    setSending(true);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.6,
        useWebWorker: true,
      });
      const { width, height } = await readImageSize(compressed);
      const uploaded = await uploadChatImage(room.id, compressed);
      if (uploaded) {
        const sent = await sendChatImageMessage(room.id, userId, {
          path: uploaded.path,
          width,
          height,
        });
        if (sent) {
          sent.image_url = uploaded.signedUrl;
          setMessages((prev) =>
            prev.some((m) => m.id === sent.id) ? prev : [...prev, sent],
          );
        }
      }
    } catch {
      // 압축/업로드 실패 — 조용히 무시 (사용자가 재시도 가능)
    } finally {
      setSending(false);
    }
  };

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
          const hasImage = !!m.image_path;
          const aspect =
            m.image_width && m.image_height
              ? `${m.image_width} / ${m.image_height}`
              : undefined;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}
              >
                {hasImage &&
                  (m.image_url ? (
                    <a
                      href={m.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.image_url}
                        alt="첨부된 사진"
                        style={{ aspectRatio: aspect }}
                        className="rounded-2xl max-w-[220px] max-h-[300px] object-cover"
                      />
                    </a>
                  ) : (
                    <div
                      style={{ aspectRatio: aspect ?? "1 / 1" }}
                      className="w-[180px] max-w-[220px] rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[11px] text-text-6"
                    >
                      사진 불러오는 중…
                    </div>
                  ))}
                {m.text && (
                  <div
                    className={`inline-block px-3 py-2 rounded-2xl text-base whitespace-pre-wrap break-words ${
                      mine
                        ? "bg-[#999f54] text-[#F2F0DC] rounded-br-sm"
                        : "bg-black/5 dark:bg-white/5 text-text-1 rounded-bl-sm"
                    } ${hasImage ? "mt-1" : ""}`}
                  >
                    {m.text}
                  </div>
                )}
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
        <label
          aria-label="사진 첨부"
          className={`p-2 rounded-full text-text-5 shrink-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${
            sending ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <ImagePlus size={20} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
            disabled={sending}
          />
        </label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={scrollToBottom}
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
