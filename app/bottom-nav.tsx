"use client";

import { Home as HomeIcon, Search, Plus, MessageCircle, Briefcase, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCoocRequestChat } from "./data/chats";
import { PROJECT_TYPES } from "./data/project-types";

export default function BottomNav() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const requestCooc = () => {
    const room = createCoocRequestChat();
    setCreateOpen(false);
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-black/10 flex items-center justify-around text-text-6 z-30">
        <Link href="/home" aria-label="Home" className="p-2"><HomeIcon size={24} /></Link>
        <Link href="/wip" aria-label="Search" className="p-2"><Search size={24} /></Link>
        <button aria-label="Create" className="p-2" onClick={() => setCreateOpen(true)}>
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white">
            <Plus size={22} />
          </span>
        </button>
        <Link href="/messages" aria-label="Messages" className="p-2"><MessageCircle size={24} /></Link>
        <Link href="/projects" aria-label="My projects" className="p-2"><Briefcase size={24} /></Link>
      </nav>

      {createOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-1">새 프로젝트</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1 text-text-5">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {PROJECT_TYPES.map(({ Icon, title, desc }) => {
                const content = (
                  <>
                    <Icon size={20} className="text-text-6 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-6">{title}</div>
                      {desc && <p className="text-[11px] text-text-6 mt-0.5">{desc}</p>}
                    </div>
                  </>
                );
                const baseClass =
                  "text-left flex items-center gap-3 p-3 rounded-xl border border-black/10 hover:bg-[#999f54]/10";
                if (title === "같이 하고 싶어요") {
                  return (
                    <Link
                      key={title}
                      href="/collab"
                      onClick={() => setCreateOpen(false)}
                      className={baseClass}
                    >
                      {content}
                    </Link>
                  );
                }
                if (title === "COOC에 요청하기") {
                  return (
                    <button key={title} onClick={requestCooc} className={baseClass}>
                      {content}
                    </button>
                  );
                }
                return (
                  <button key={title} className={baseClass}>
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
