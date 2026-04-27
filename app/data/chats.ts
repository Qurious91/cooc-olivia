// 1:1 채팅 DB 헬퍼.
// chat_rooms는 (collab_id, applicant_id) 쌍으로 유니크. 작성자(collab.author)와 신청자가 멤버.
// 모든 조회/쓰기는 RLS로 통제됨 — 멤버 외엔 접근 불가.

import { createClient } from "@/lib/supabase/client";

export type ChatMessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type ChatRoomRow = {
  id: string;
  collab_id: string;
  applicant_id: string;
  author_last_read_at: string;
  applicant_last_read_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * (collab, applicant) 쌍의 채팅방을 찾거나 새로 만들어 id를 반환.
 * 동시 호출 시 unique 제약으로 한쪽 insert가 실패해도 select fallback으로 동일 id 반환.
 */
export async function findOrCreateChatRoom(
  collabId: string,
  applicantId: string,
): Promise<string | null> {
  const supabase = createClient();

  // 우선 select — 이미 존재하면 그대로 반환
  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("collab_id", collabId)
    .eq("applicant_id", applicantId)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  // 없으면 insert. 중복이면 다시 select.
  const { data: created, error } = await supabase
    .from("chat_rooms")
    .insert({ collab_id: collabId, applicant_id: applicantId })
    .select("id")
    .single();
  if (created?.id) return created.id as string;

  if (error) {
    const { data: race } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("collab_id", collabId)
      .eq("applicant_id", applicantId)
      .maybeSingle();
    return race?.id ?? null;
  }
  return null;
}

/**
 * 룸의 메시지를 시간 오름차순으로 fetch.
 */
export async function loadChatMessages(
  roomId: string,
): Promise<ChatMessageRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("id, room_id, sender_id, text, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ChatMessageRow[];
}

/**
 * 메시지 전송. RLS가 sender_id = auth.uid() + 룸 멤버 조건 검증.
 */
export async function sendChatMessage(
  roomId: string,
  senderId: string,
  text: string,
): Promise<ChatMessageRow | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ room_id: roomId, sender_id: senderId, text: trimmed })
    .select("id, room_id, sender_id, text, created_at")
    .single();
  if (error || !data) return null;
  return data as ChatMessageRow;
}

/**
 * 본인의 last_read_at 갱신 (역할에 따라 author_last_read_at 또는 applicant_last_read_at).
 */
export async function markChatRead(
  roomId: string,
  userId: string,
): Promise<void> {
  const supabase = createClient();
  // 룸 가져와서 내가 author인지 applicant인지 판단
  const { data: room } = await supabase
    .from("chat_rooms")
    .select("collab_id, applicant_id")
    .eq("id", roomId)
    .maybeSingle();
  if (!room) return;
  const { data: collab } = await supabase
    .from("collabs")
    .select("author_id")
    .eq("id", room.collab_id)
    .maybeSingle();
  const isAuthor = collab?.author_id === userId;
  const isApplicant = room.applicant_id === userId;
  if (!isAuthor && !isApplicant) return;
  const patch = isAuthor
    ? { author_last_read_at: new Date().toISOString() }
    : { applicant_last_read_at: new Date().toISOString() };
  await supabase.from("chat_rooms").update(patch).eq("id", roomId);
}

/**
 * 내가 멤버인 모든 룸을 가져옴 (작성자이거나 신청자인 경우).
 * 메시지 미리보기·상대방 프로필도 함께 포함.
 */
export type ChatRoomListItem = {
  id: string;
  collabTitle: string;
  collabId: string;
  otherUserId: string;
  otherNickname: string;
  otherAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export async function loadMyChatRooms(
  userId: string,
): Promise<ChatRoomListItem[]> {
  const supabase = createClient();

  // 1. 내가 신청자거나, 내가 작성자인 collab의 룸을 모두 가져옴
  const { data: rows } = await supabase
    .from("chat_rooms")
    .select(
      "id, collab_id, applicant_id, author_last_read_at, applicant_last_read_at, " +
        "collabs!chat_rooms_collab_id_fkey(id, title, author_id, " +
        "profiles!collabs_author_id_fkey(id, nickname, name, avatar_url)" +
        "), " +
        "applicant:profiles!chat_rooms_applicant_id_fkey(id, nickname, name, avatar_url)",
    )
    .order("updated_at", { ascending: false });
  if (!rows) return [];

  const roomIds = (rows as any[]).map((r) => r.id as string);
  if (roomIds.length === 0) return [];

  // 2. 마지막 메시지들을 한꺼번에 fetch
  const { data: lastMessages } = await supabase
    .from("chat_messages")
    .select("room_id, text, created_at")
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });
  const lastByRoom = new Map<string, { text: string; created_at: string }>();
  for (const m of (lastMessages ?? []) as any[]) {
    if (!lastByRoom.has(m.room_id)) {
      lastByRoom.set(m.room_id, { text: m.text, created_at: m.created_at });
    }
  }

  // 룸별 안 읽음 카운트 — 내 last_read_at보다 새 메시지 + 상대가 보낸 것만
  const unreadByRoom = new Map<string, number>();
  await Promise.all(
    (rows as any[]).map(async (r) => {
      const collab = r.collabs ?? null;
      const isAuthor = collab?.author_id === userId;
      const since = isAuthor
        ? r.author_last_read_at
        : r.applicant_last_read_at;
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("room_id", r.id)
        .gt("created_at", since)
        .neq("sender_id", userId);
      unreadByRoom.set(r.id, count ?? 0);
    }),
  );

  return (rows as any[]).map((r) => {
    const collab = r.collabs ?? null;
    const isAuthor = collab?.author_id === userId;
    const other = isAuthor ? r.applicant : collab?.profiles;
    const otherNickname =
      other?.nickname?.trim() || other?.name?.trim() || "익명";
    const last = lastByRoom.get(r.id);
    return {
      id: r.id,
      collabTitle: collab?.title ?? "",
      collabId: collab?.id ?? r.collab_id,
      otherUserId: other?.id ?? "",
      otherNickname,
      otherAvatarUrl: other?.avatar_url ?? null,
      lastMessage: last?.text ?? null,
      lastMessageAt: last?.created_at ?? null,
      unreadCount: unreadByRoom.get(r.id) ?? 0,
    };
  });
}
