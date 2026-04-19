"use client";

import { ArrowLeft, Handshake } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveCollab } from "../data/collabs";

const KINDS = ["게스트 초청", "메뉴 테스트", "메뉴 개발", "팝업 행사", "컨설팅"] as const;

export default function NewCollab() {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("게스트 초청");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [partner, setPartner] = useState("");
  const [period, setPeriod] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveCollab({ kind, title: title.trim(), desc: desc.trim(), partner: partner.trim(), period: period.trim() });
    router.push("/works");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 flex items-center gap-2 px-3 py-3">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1.5 rounded-full hover:bg-black/5"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Handshake size={18} className="text-[#999f54]" />
          <h1 className="text-base font-semibold text-text-1">같이 하고 싶어요</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24 max-w-xl w-full mx-auto">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-4 mb-2">종류</label>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap border ${
                    kind === k
                      ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                      : "bg-white text-text-4 border-black/15"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 시즈널 디저트 코스 공동개발"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">설명</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              placeholder="어떤 협업인지, 기대하는 결과물은 무엇인지 적어주세요."
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">찾는 파트너</label>
            <input
              type="text"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="예) 파티시에, 바리스타, 소믈리에"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">기간</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="예) 2026.05 – 2026.06"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              href="/home"
              className="flex-1 py-2.5 rounded-lg border border-black/15 text-sm text-text-4 text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
            >
              등록하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
