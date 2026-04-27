"use client";

import { Bell, CheckCircle2, Inbox, LogOut, MessageCircle, Moon, Sun, User, UserPlus, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { loadMyChatRooms, type ChatRoomListItem } from "./data/chats";

type NotifEntry = {
  c: { id: string; title: string; kind: string };
  count: number;
};

type ResultNotif = {
  appId: string;
  collabId: string;
  collabTitle: string;
  status: "accepted" | "declined";
  updatedAt: string;
};

const RESULTS_SEEN_IDS_KEY = "cooc.results.seenIds";

type ProfileLite = {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export default function HeaderActions() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myCollabIds, setMyCollabIds] = useState<string[]>([]);
  const [myRoomIds, setMyRoomIds] = useState<string[]>([]);
  const [notifs, setNotifs] = useState<NotifEntry[]>([]);
  const [chatNotifs, setChatNotifs] = useState<ChatRoomListItem[]>([]);
  const [resultNotifs, setResultNotifs] = useState<ResultNotif[]>([]);
  const [seenResultIds, setSeenResultIds] = useState<Set<string>>(new Set());
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifPos, setNotifPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [userPos, setUserPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    try {
      const raw = localStorage.getItem(RESULTS_SEEN_IDS_KEY);
      if (raw) setSeenResultIds(new Set(JSON.parse(raw) as string[]));
    } catch {}

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [profileRes, notifRes, myCollabsRes, myRoomsRes, chatRoomsList, resultsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("name, email, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("collab_applications")
            .select(
              "collab_id, collabs!inner(id, title, author_id, collab_kinds(label))",
            )
            .eq("status", "pending")
            .eq("collabs.author_id", user.id),
          supabase.from("collabs").select("id").eq("author_id", user.id),
          supabase.from("chat_rooms").select("id"),
          loadMyChatRooms(user.id),
          supabase
            .from("collab_applications")
            .select("id, status, updated_at, collabs!inner(id, title)")
            .eq("applicant_id", user.id)
            .in("status", ["accepted", "declined"])
            .order("updated_at", { ascending: false })
            .limit(5),
        ]);

      if (myCollabsRes.data) {
        setMyCollabIds(myCollabsRes.data.map((c: { id: string }) => c.id));
      }
      if (myRoomsRes.data) {
        setMyRoomIds(myRoomsRes.data.map((r: { id: string }) => r.id));
      }
      setChatNotifs(chatRoomsList.filter((r) => r.unreadCount > 0));

      if (resultsRes.data) {
        setResultNotifs(
          (resultsRes.data as any[]).map((r) => ({
            appId: r.id,
            collabId: r.collabs.id,
            collabTitle: r.collabs.title,
            status: r.status,
            updatedAt: r.updated_at,
          })),
        );
      }

      if (profileRes.data) {
        setProfile(profileRes.data as ProfileLite);
      } else {
        setProfile({
          name: null,
          email: user.email ?? null,
          avatar_url: null,
        });
      }

      if (notifRes.error) {
        console.error(
          "[header-actions] notif select failed",
          notifRes.error.message,
          notifRes.error.details,
          notifRes.error.hint,
          notifRes.error.code,
        );
      } else if (notifRes.data) {
        const map = new Map<string, NotifEntry>();
        for (const row of notifRes.data as any[]) {
          const c = row.collabs;
          if (!c) continue;
          const existing = map.get(c.id);
          if (existing) existing.count += 1;
          else
            map.set(c.id, {
              c: { id: c.id, title: c.title, kind: c.collab_kinds?.label ?? "" },
              count: 1,
            });
        }
        setNotifs([...map.values()]);
      }
    })();
  }, [supabase]);

  // 내 collab들에 들어오는 신청을 헤더 종 배지에 실시간 반영
  useEffect(() => {
    if (!userId || myCollabIds.length === 0) return;
    const channel = supabase
      .channel(`header-notifs:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collab_applications",
          filter: `collab_id=in.(${myCollabIds.join(",")})`,
        },
        async () => {
          const { data, error } = await supabase
            .from("collab_applications")
            .select(
              "collab_id, collabs!inner(id, title, author_id, collab_kinds(label))",
            )
            .eq("status", "pending")
            .eq("collabs.author_id", userId);
          if (error || !data) return;
          const map = new Map<string, NotifEntry>();
          for (const row of data as any[]) {
            const c = row.collabs;
            if (!c) continue;
            const existing = map.get(c.id);
            if (existing) existing.count += 1;
            else
              map.set(c.id, {
                c: {
                  id: c.id,
                  title: c.title,
                  kind: c.collab_kinds?.label ?? "",
                },
                count: 1,
              });
          }
          setNotifs([...map.values()]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, myCollabIds]);

  // 내가 보낸 신청의 status 변경 (수락/거절)을 헤더 종 배지에 실시간 반영
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`header-results:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collab_applications",
          filter: `applicant_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("collab_applications")
            .select("id, status, updated_at, collabs!inner(id, title)")
            .eq("applicant_id", userId)
            .in("status", ["accepted", "declined"])
            .order("updated_at", { ascending: false })
            .limit(5);
          if (!data) return;
          setResultNotifs(
            (data as any[]).map((r) => ({
              appId: r.id,
              collabId: r.collabs.id,
              collabTitle: r.collabs.title,
              status: r.status,
              updatedAt: r.updated_at,
            })),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // 내 채팅방의 새 메시지/읽음 갱신을 헤더 종 배지에 실시간 반영
  useEffect(() => {
    if (!userId) return;
    const channels = [
      supabase
        .channel(`header-chat-msgs:${userId}`)
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
            setChatNotifs(list.filter((r) => r.unreadCount > 0));
          },
        )
        .subscribe(),
      supabase
        .channel(`header-chat-rooms:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_rooms",
          },
          async () => {
            const list = await loadMyChatRooms(userId);
            setChatNotifs(list.filter((r) => r.unreadCount > 0));
            // 새 룸 생성/접근 시 myRoomIds도 갱신
            const { data } = await supabase.from("chat_rooms").select("id");
            if (data) {
              setMyRoomIds(data.map((r: { id: string }) => r.id));
            }
          },
        )
        .subscribe(),
    ];
    return () => {
      for (const c of channels) supabase.removeChannel(c);
    };
  }, [supabase, userId, myRoomIds]);

  useEffect(() => {
    if (!notifOpen && !userOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifOpen && (notifBtnRef.current?.contains(t) || notifPanelRef.current?.contains(t))) return;
      if (userOpen && (userBtnRef.current?.contains(t) || userPanelRef.current?.contains(t))) return;
      setNotifOpen(false);
      setUserOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [notifOpen, userOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleNotif = () => {
    if (!notifOpen && notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: rect.bottom + 8, right: 16 });
    }
    setUserOpen(false);
    setNotifOpen((v) => !v);
  };

  const markResultSeen = (appId: string) => {
    setSeenResultIds((prev) => {
      const next = new Set(prev);
      next.add(appId);
      try {
        localStorage.setItem(RESULTS_SEEN_IDS_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const toggleUser = () => {
    if (!userOpen && userBtnRef.current) {
      const rect = userBtnRef.current.getBoundingClientRect();
      setUserPos({ top: rect.bottom + 8, right: 16 });
    }
    setNotifOpen(false);
    setUserOpen((v) => !v);
  };

  const handleSignOut = async () => {
    setUserOpen(false);
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  const pending = notifs.reduce((s, e) => s + e.count, 0);
  const chatUnreadTotal = chatNotifs.reduce((s, r) => s + r.unreadCount, 0);
  const visibleResults = resultNotifs.filter(
    (r) => !seenResultIds.has(r.appId),
  );
  const totalBadge = pending + chatUnreadTotal + visibleResults.length;

  const openCollab = (id: string) => {
    setNotifOpen(false);
    router.push(`/projects?tab=mine&open=${encodeURIComponent(id)}`);
  };

  const openChatRoom = (id: string) => {
    setNotifOpen(false);
    router.push(`/chat?id=${encodeURIComponent(id)}`);
  };

  const seeAll = () => {
    setNotifOpen(false);
    router.push("/projects?tab=mine");
  };

  const seeAllChats = () => {
    setNotifOpen(false);
    router.push("/messages");
  };

  const openApplicationResult = (appId: string) => {
    markResultSeen(appId);
    setNotifOpen(false);
    router.push(`/projects?tab=sent&open=${encodeURIComponent(appId)}`);
  };

  const seeAllResults = () => {
    setNotifOpen(false);
    router.push("/projects?tab=sent");
  };

  const displayName = profile?.name?.trim() || "내 계정";
  const displayEmail = profile?.email ?? "";

  return (
    <div className="flex items-center gap-1 text-text-6">
      <button
        ref={notifBtnRef}
        onClick={toggleNotif}
        aria-label="Notifications"
        aria-expanded={notifOpen}
        className="relative p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell size={20} />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
            {totalBadge > 99 ? "99+" : totalBadge}
          </span>
        )}
      </button>
      <button
        ref={userBtnRef}
        onClick={toggleUser}
        aria-label="Account"
        aria-expanded={userOpen}
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center overflow-hidden"
      >
        {profile?.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.avatar_url}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <User size={20} />
        )}
      </button>
      {mounted && notifOpen &&
        createPortal(
          <div
            ref={notifPanelRef}
            role="menu"
            style={{ top: notifPos.top, right: notifPos.right }}
            className="fixed w-80 max-h-[80vh] rounded-xl border border-border bg-surface shadow-lg z-[60] overflow-hidden flex flex-col"
          >
            <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 text-[11px] text-text-5 shrink-0">
              알림 {totalBadge}건
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-text-4 inline-flex items-center gap-1.5">
                  <UserPlus size={12} />
                  참여 요청 {pending}
                </div>
                {notifs.length > 0 && (
                  <button
                    type="button"
                    onClick={seeAll}
                    className="text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold hover:underline"
                  >
                    전체 보기
                  </button>
                )}
              </div>
              {notifs.length > 0 && (
                <p className="px-3 pb-2 text-[10px] text-text-6">
                  수락 또는 거절하면 알림이 사라져요.
                </p>
              )}
              {notifs.length === 0 ? (
                <div className="px-3 py-3 text-[11px] text-text-6">
                  아직 들어온 참여 요청이 없어요.
                </div>
              ) : (
                <ul>
                  {notifs.map(({ c, count }) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => openCollab(c.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <span className="shrink-0 w-8 h-8 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] inline-flex items-center justify-center">
                          <UserPlus size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-text-1 truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-text-5 truncate">
                            {c.kind}
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] font-semibold">
                          {count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-2 border-t border-black/5 dark:border-white/10" />

              <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-text-4 inline-flex items-center gap-1.5">
                  <MessageCircle size={12} />
                  새 메시지 {chatUnreadTotal}
                </div>
                <button
                  type="button"
                  onClick={seeAllChats}
                  className="text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold hover:underline"
                >
                  전체 보기
                </button>
              </div>
              {chatNotifs.length === 0 ? (
                <div className="px-3 py-3 text-[11px] text-text-6">
                  새 메시지가 없어요.
                </div>
              ) : (
                <ul className="pb-1">
                  {chatNotifs.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => openChatRoom(r.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <span className="shrink-0 w-8 h-8 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                          {r.otherAvatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={r.otherAvatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={14} strokeWidth={1.75} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-text-1 truncate">
                            {r.otherNickname}
                          </div>
                          <div className="text-[11px] text-text-5 truncate">
                            {r.lastMessage ?? "새 메시지"}
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-semibold">
                          {r.unreadCount}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-2 border-t border-black/5 dark:border-white/10" />

              <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-text-4 inline-flex items-center gap-1.5">
                  <Inbox size={12} />
                  신청 결과 {visibleResults.length}
                </div>
                {visibleResults.length > 0 && (
                  <button
                    type="button"
                    onClick={seeAllResults}
                    className="text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold hover:underline"
                  >
                    전체 보기
                  </button>
                )}
              </div>
              {visibleResults.length > 0 && (
                <p className="px-3 pb-2 text-[10px] text-text-6">
                  확인하면 알림이 사라져요.
                </p>
              )}
              {visibleResults.length === 0 ? (
                <div className="px-3 py-3 text-[11px] text-text-6">
                  새 신청 결과가 없어요.
                </div>
              ) : (
                <ul className="pb-1">
                  {visibleResults.map((r) => {
                    const accepted = r.status === "accepted";
                    return (
                      <li key={r.appId}>
                        <button
                          type="button"
                          onClick={() => openApplicationResult(r.appId)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                        >
                          <span
                            className={`shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center ${
                              accepted
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/10 text-red-600 dark:text-red-300"
                            }`}
                          >
                            {accepted ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-text-1 truncate">
                              {r.collabTitle}
                            </div>
                            <div
                              className={`text-[11px] truncate ${
                                accepted
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-red-600 dark:text-red-300"
                              }`}
                            >
                              {accepted ? "수락됐어요" : "거절됐어요"}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
      {mounted && userOpen &&
        createPortal(
          <div
            ref={userPanelRef}
            role="menu"
            style={{ top: userPos.top, right: userPos.right }}
            className="fixed w-64 rounded-xl border border-border bg-surface shadow-lg z-[60] overflow-hidden p-1.5"
          >
            <Link
              href="/profile"
              onClick={() => setUserOpen(false)}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.10] transition-colors"
            >
              <span className="shrink-0 w-10 h-10 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} strokeWidth={1.75} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-1 truncate">
                  {displayName}
                </div>
                {displayEmail && (
                  <div className="text-[11px] text-text-5 truncate">
                    {displayEmail}
                  </div>
                )}
              </div>
            </Link>
            <div className="my-1 border-t border-black/5 dark:border-white/10" />
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-text-1 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              {dark ? <Sun size={16} className="text-text-5" /> : <Moon size={16} className="text-text-5" />}
              {dark ? "라이트 모드" : "다크 모드"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-text-1 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <LogOut size={16} className="text-text-5" />
              로그아웃
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
