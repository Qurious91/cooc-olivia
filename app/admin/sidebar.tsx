"use client";

import { useEffect, useState } from "react";
import AdminNav from "./nav";
import AdminSidebarActions from "./sidebar-actions";

const KEY = "cooc.admin.sidebar";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "collapsed") setCollapsed(true);
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, next ? "collapsed" : "expanded");
      } catch {}
      return next;
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    toggle();
  };

  return (
    <aside
      onClick={handleClick}
      className={`shrink-0 border-r border-[#999f54]/30 max-[1099px]:hidden flex flex-col sticky top-14 self-start h-[calc(100dvh-3.5rem)] cursor-pointer overflow-hidden transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <AdminNav collapsed={collapsed} />
      <AdminSidebarActions collapsed={collapsed} />
    </aside>
  );
}
