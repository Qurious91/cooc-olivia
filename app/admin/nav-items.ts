import { Handshake, LayoutDashboard, User, type LucideIcon } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/profiles", label: "프로필", Icon: User },
  { href: "/admin/collabs", label: "협업", Icon: Handshake },
];
