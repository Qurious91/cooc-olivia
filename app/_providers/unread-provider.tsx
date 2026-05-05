"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { loadMyChatRooms, type ChatRoomListItem } from "../data/chats";

type UnreadContextValue = {
  userId: string | null;
  chatRooms: ChatRoomListItem[];
  chatUnreadTotal: number;
  refresh: () => Promise<void>;
};

const UnreadContext = createContext<UnreadContextValue | null>(null);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoomListItem[]>([]);
  const [myRoomIds, setMyRoomIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const list = await loadMyChatRooms(userId);
    setChatRooms(list);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);
      const [list, roomsRes] = await Promise.all([
        loadMyChatRooms(user.id),
        supabase.from("chat_rooms").select("id"),
      ]);
      if (cancelled) return;
      setChatRooms(list);
      if (roomsRes.data) {
        setMyRoomIds(roomsRes.data.map((r: { id: string }) => r.id));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`unread-msgs:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          ...(myRoomIds.length > 0
            ? { filter: `room_id=in.(${myRoomIds.join(",")})` }
            : {}),
        },
        async () => {
          const list = await loadMyChatRooms(userId);
          setChatRooms(list);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, myRoomIds]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`unread-rooms:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_rooms" },
        async () => {
          const list = await loadMyChatRooms(userId);
          setChatRooms(list);
          const { data } = await supabase.from("chat_rooms").select("id");
          if (data) {
            setMyRoomIds(data.map((r: { id: string }) => r.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const chatUnreadTotal = useMemo(
    () => chatRooms.reduce((s, r) => s + r.unreadCount, 0),
    [chatRooms],
  );

  const value = useMemo<UnreadContextValue>(
    () => ({ userId, chatRooms, chatUnreadTotal, refresh }),
    [userId, chatRooms, chatUnreadTotal, refresh],
  );

  return (
    <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
  );
}

export function useUnread(): UnreadContextValue {
  const ctx = useContext(UnreadContext);
  if (!ctx) {
    return {
      userId: null,
      chatRooms: [],
      chatUnreadTotal: 0,
      refresh: async () => {},
    };
  }
  return ctx;
}
