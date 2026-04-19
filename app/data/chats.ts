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

export function createCoocChat(args: {
  collab: {
    title: string;
    kind: string;
    desc?: string;
    partner?: string;
    period?: string;
  };
  applicantNames: string[];
}): ChatRoom {
  const existing = read().find(
    (r) => r.withName === "COOC" && r.sourceTitle === args.collab.title,
  );
  if (existing) return existing;

  const { collab, applicantNames } = args;
  const summaryLines = [
    `[${collab.kind}] ${collab.title}`,
    collab.desc?.trim() ? `· ${collab.desc.trim()}` : null,
    collab.partner?.trim() ? `· 찾는 파트너: ${collab.partner.trim()}` : null,
    collab.period?.trim() ? `· 기간: ${collab.period.trim()}` : null,
  ].filter(Boolean) as string[];

  const applicantNote =
    applicantNames.length > 0
      ? `참여 요청 주신 ${applicantNames.length}분(${applicantNames.join(", ")}) 제가 순서대로 컨택해볼게요. 우선 연결하고 싶은 분이나 꼭 맞춰야 할 조건 있으면 편하게 말씀 주세요.`
      : "관심 있는 분 생기면 바로 연결 도와드릴게요. 원하시는 프로필 있으시면 알려주세요.";

  const now = Date.now();
  const room: ChatRoom = {
    id: makeId(),
    withName: "COOC",
    withRole: "에이전시",
    sourceTitle: collab.title,
    createdAt: now,
    messages: [
      {
        id: makeId(),
        from: "system",
        text: "COOC 에이전시와의 상담이 시작됐어요.",
        time: now,
      },
      {
        id: makeId(),
        from: "them",
        text: "안녕하세요! 이번 제안 맡게 된 COOC 담당자예요.",
        time: now + 1,
      },
      {
        id: makeId(),
        from: "them",
        text: `받은 내용 정리해봤어요.\n\n${summaryLines.join("\n")}\n\n맞게 봤나요?`,
        time: now + 2,
      },
      {
        id: makeId(),
        from: "them",
        text: applicantNote,
        time: now + 3,
      },
    ],
  };

  const rooms = read();
  rooms.push(room);
  write(rooms);
  return room;
}

export function createCoocApplyChat(args: {
  listing: {
    title: string;
    host: string;
    kind: string;
    detail?: string;
    budget?: string;
    capacity?: string;
    contact?: string;
  };
}): ChatRoom {
  const existing = read().find(
    (r) => r.withName === "COOC" && r.sourceTitle === args.listing.title,
  );
  if (existing) return existing;

  const { listing } = args;
  const summaryLines = [
    `[${listing.kind}] ${listing.title}`,
    `· 주최: ${listing.host}`,
    listing.detail?.trim() ? `· ${listing.detail.trim()}` : null,
    listing.budget?.trim() ? `· 예산: ${listing.budget.trim()}` : null,
    listing.capacity?.trim() ? `· 규모: ${listing.capacity.trim()}` : null,
  ].filter(Boolean) as string[];

  const now = Date.now();
  const room: ChatRoom = {
    id: makeId(),
    withName: "COOC",
    withRole: "에이전시",
    sourceTitle: listing.title,
    createdAt: now,
    messages: [
      {
        id: makeId(),
        from: "system",
        text: "COOC 에이전시와의 상담이 시작됐어요.",
        time: now,
      },
      {
        id: makeId(),
        from: "them",
        text: `안녕하세요! 아래 제안에 참여하고 싶으신 거 맞죠?\n\n${summaryLines.join("\n")}\n\n주최자와의 소개, 일정 조율 도와드릴게요. 관심 있는 포인트나 선호 역할 알려주시면 더 잘 연결해드릴 수 있어요.`,
        time: now + 1,
      },
    ],
  };

  const rooms = read();
  rooms.push(room);
  write(rooms);
  return room;
}

export function createCoocRequestChat(): ChatRoom {
  const existing = read().find(
    (r) => r.withName === "COOC" && r.sourceTitle === "COOC 에이전시 상담",
  );
  if (existing) return existing;

  const now = Date.now();
  const room: ChatRoom = {
    id: makeId(),
    withName: "COOC",
    withRole: "에이전시",
    sourceTitle: "COOC 에이전시 상담",
    createdAt: now,
    messages: [
      {
        id: makeId(),
        from: "system",
        text: "COOC 에이전시와의 상담이 시작됐어요.",
        time: now,
      },
      {
        id: makeId(),
        from: "them",
        text: "안녕하세요! COOC 담당자예요. 어떤 도움이 필요하신가요? 협업, 공간, 브랜드 소싱 무엇이든 편하게 말씀 주세요.",
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
