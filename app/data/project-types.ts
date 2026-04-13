import { Search, Send, Handshake, Sparkles, type LucideIcon } from "lucide-react";

export type ProjectType = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

export const PROJECT_TYPES: ProjectType[] = [
  { Icon: Search, title: "찾고 싶어요", desc: "셰프, 브랜드, 공간 탐색" },
  { Icon: Send, title: "연락하고 싶어요", desc: "제안 보내기/문의하기" },
  { Icon: Handshake, title: "같이 하고 싶어요", desc: "협업/거래/공모 시작" },
  { Icon: Sparkles, title: "COOC에 요청하기", desc: "" },
];
