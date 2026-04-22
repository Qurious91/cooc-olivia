"use client";

import { Sparkles } from "lucide-react";
import Chip from "../../_components/chip";

export default function DesignPage() {
  return (
    <main className="flex-1 px-4 pt-6 pb-24 min-[1100px]:pb-8 max-w-2xl w-full mx-auto">
      <h1 className="text-xl font-bold text-text-1">디자인</h1>
      <p className="text-sm text-text-5 mt-1">공통 컴포넌트 프리뷰</p>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-3">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">CHIP</div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-6 w-20 shrink-0">기본 (1rem)</span>
          <Chip>admin</Chip>
          <Chip leadingIcon={<Sparkles size="0.85em" />}>new</Chip>
          <Chip onRemove={() => {}}>키워드</Chip>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-6 w-20 shrink-0">0.8rem</span>
          <Chip className="text-[0.8rem]">admin</Chip>
          <Chip variant="status" status="recruiting" className="text-[0.8rem]">
            recruiting
          </Chip>
          <Chip variant="status" status="in_progress" className="text-[0.8rem]">
            in_progress
          </Chip>
          <Chip variant="status" status="done" className="text-[0.8rem]">
            done
          </Chip>
          <Chip variant="status" status="cancelled" className="text-[0.8rem]">
            cancelled
          </Chip>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-6 w-20 shrink-0">0.7rem</span>
          <Chip className="text-[0.7rem]">admin</Chip>
          <Chip variant="status" status="active" className="text-[0.7rem]">
            active
          </Chip>
          <Chip variant="status" status="suspended" className="text-[0.7rem]">
            suspended
          </Chip>
          <Chip variant="status" status="pending" className="text-[0.7rem]">
            pending
          </Chip>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-6 w-20 shrink-0">outline</span>
          <Chip variant="outline">전체</Chip>
          <Chip variant="outline" className="text-[0.8rem]">게스트</Chip>
          <Chip variant="outline" className="text-[0.7rem]">팝업</Chip>
        </div>
      </section>
    </main>
  );
}
