export type CollabKind =
  | "게스트 초청"
  | "메뉴 개발"
  | "팝업 행사"
  | "컨설팅";

export type CollabAuthorMode = "소속" | "이름" | "둘 다";

export type Collab = {
  id: string;
  kind: CollabKind;
  title: string;
  desc: string;
  partner: string;
  period: string;
  createdAt: number;
  author?: CollabAuthorMode;
  authorName?: string;
  authorAffiliation?: string;
};

export function collabHostLabel(c: Collab): string {
  if (c.author && (c.authorName || c.authorAffiliation)) {
    if (c.author === "이름") return c.authorName ?? "";
    if (c.author === "소속") return c.authorAffiliation ?? "";
    return [c.authorAffiliation, c.authorName].filter(Boolean).join(" · ");
  }
  return c.partner?.trim() || "내가 올림";
}

const KEY = "cooc.collabs.v1";

function makeId() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadCollabs(): Collab[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Collab[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCollab(input: Omit<Collab, "id" | "createdAt">): Collab {
  const entry: Collab = { ...input, id: makeId(), createdAt: Date.now() };
  const list = loadCollabs();
  list.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(list));
  return entry;
}

export function deleteCollab(id: string) {
  const next = loadCollabs().filter((c) => c.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
