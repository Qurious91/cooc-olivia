"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export default function AdminNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-3 flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              active
                ? "bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] font-semibold"
                : "text-text-4 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span
              className={`overflow-hidden transition-all duration-200 ${
                collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
