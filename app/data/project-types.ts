import { Search, Handshake, type LucideIcon } from "lucide-react";

export type ProjectType = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

export const PROJECT_TYPES: ProjectType[] = [
  { Icon: Search, title: "찾고 싶어요", desc: "공모 중인 협업 찾기" },
  { Icon: Handshake, title: "같이 하고 싶어요", desc: "협업/거래/공모 시작" },
];
