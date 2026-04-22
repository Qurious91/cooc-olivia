"use client";

import { Handshake, LayoutDashboard, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/profiles", label: "프로필", Icon: User },
  { href: "/admin/collabs", label: "협업", Icon: Handshake },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-3 flex flex-col gap-1">
      {ITEMS.map(({ href, label, Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              active
                ? "bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] font-semibold"
                : "text-text-4 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
