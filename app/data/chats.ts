export type ChatMessage = {
  id: string;
  from: "me" | "them" | "system";
  text: string;
  time: number;
};

export type ChatRoom = {
  id: string;
  withName: string;
  withRole: string;
  sourceTitle: string;
  messages: ChatMessage[];
  createdAt: number;
};

const KEY = "cooc.chats.v1";

function makeId() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function read(): ChatRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatRoom[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(rooms: ChatRoom[]) {
  window.localStorage.setItem(KEY, JSON.stringify(rooms));
}

export function loadChats(): ChatRoom[] {
  return read().sort((a, b) => lastTime(b) - lastTime(a));
}

export function getChat(id: string): ChatRoom | null {
  return read().find((r) => r.id === id) ?? null;
}

export function findChatByTarget(
  withName: string,
  withRole: string,
  sourceTitle: string,
): ChatRoom | null {
  return (
    read().find(
      (r) =>
        r.withName === withName &&
        r.withRole === withRole &&
        r.sourceTitle === sourceTitle,
    ) ?? null
  );
}

export function createChat(args: {
  withName: string;
  withRole: string;
  sourceTitle: string;
}): ChatRoom {
  const existing = findChatByTarget(args.withName, args.withRole, args.sourceTitle);
  if (existing) return existing;

  const now = Date.now();
  const greeting = args.sourceTitle
    ? `안녕하세요! "${args.sourceTitle}" 제안에 합류할 수 있게 되어 감사합니다. 편한 시간에 첫 미팅 잡아볼 수 있을까요?`
    : "안녕하세요! 수락해 주셔서 감사합니다. 편한 시간에 미팅 잡을 수 있을까요?";

  const room: ChatRoom = {
    id: makeId(),
    withName: args.withName,
    withRole: args.withRole,
    sourceTitle: args.sourceTitle,
    createdAt: now,
    messages: [
      {
        id: makeId(),
        from: "system",
        text: args.sourceTitle
          ? `"${args.sourceTitle}" 참여 요청을 수락했어요.`
          : "참여 요청을 수락했어요.",
        time: now,
      },
      {
        id: makeId(),
        from: "them",
        text: greeting,
        time: now + 1,
      },
    ],
  };

  const rooms = read();
  rooms.push(room);
  write(rooms);
  return room;
}

export function appendMessage(chatId: string, msg: ChatMessage) {
  const rooms = read();
  const idx = rooms.findIndex((r) => r.id === chatId);
  if (idx < 0) return;
  rooms[idx] = { ...rooms[idx], messages: [...rooms[idx].messages, msg] };
  write(rooms);
}

export function deleteChat(id: string) {
  write(read().filter((r) => r.id !== id));
}

export function makeMessageId() {
  return makeId();
}

function lastTime(r: ChatRoom): number {
  const last = r.messages[r.messages.length - 1];
  return last ? last.time : r.createdAt;
}
