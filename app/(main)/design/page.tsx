"use client";

import {
  ArrowRight,
  Briefcase,
  ChefHat,
  Compass,
  FlaskConical,
  Handshake,
  Heart,
  ImagePlus,
  Plus,
  Search,
  Sparkles,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
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

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-4">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">EMPTY STATE</div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">현재 (underline 링크)</div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">
              아직 보낸 참여 요청이 없어요.{" "}
              <Link className="text-[#4a4d22] dark:text-[#d4d8a8] underline" href="/explore">
                탐색하러 가기
              </Link>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">A — 아이콘 + 헤드라인 + primary 버튼</div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] mb-3">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-1">아직 보낸 참여 요청이 없어요</h3>
            <p className="mt-1 text-xs text-text-5">관심있는 협업을 찾아서 참여해보세요</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
            >
              탐색하러 가기
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">B — 미니멀 outlined 버튼 (권장)</div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">아직 보낸 참여 요청이 없어요</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full border border-[#999f54]/40 text-xs text-[#4a4d22] dark:text-[#d4d8a8] hover:bg-[#999f54]/10"
            >
              탐색하러 가기
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">C — 칩 스타일 인라인</div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">
              아직 보낸 참여 요청이 없어요.{" "}
              <Link
                href="/explore"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] text-[11px] font-semibold"
              >
                <ArrowRight size={10} />
                탐색하러 가기
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-6">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">HOME COMPOSITION</div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">A — 대시보드형 (로그인 유저 중심)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-3 space-y-3">
            <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#999f54] to-[#4a4d22]">
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <div className="inline-flex items-center gap-1.5 text-[11px] opacity-90">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  F&B 협업 전문 플랫폼
                </div>
                <h2 className="text-xl font-bold mt-1">Cook, Connect, Collab.</h2>
              </div>
            </div>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-1 mb-2">어떤 협업을 원하시나요?</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { I: UserPlus, l: "게스트" },
                  { I: FlaskConical, l: "테스트" },
                  { I: ChefHat, l: "개발" },
                  { I: Store, l: "팝업" },
                  { I: Handshake, l: "컨설팅" },
                ].map(({ I, l }) => (
                  <div key={l} className="flex flex-col items-center gap-1">
                    <span className="w-10 h-10 rounded-full bg-[#999f54]/10 flex items-center justify-center">
                      <I size={18} />
                    </span>
                    <span className="text-[10px] text-text-4">{l}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-1">당신을 위한 추천</h3>
                <span className="text-[11px] text-[#999f54]">전체보기</span>
              </div>
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 snap-x">
                {[
                  { tag: "#이탈리안 #팝업", t: "시즈널 디저트 코스 공동개발", s: "박셰프 · 성수" },
                  { tag: "#베이커리", t: "브런치 메뉴 신규 라인업", s: "오베이커 · 연남" },
                  { tag: "#소믈리에", t: "와인 페어링 시그니처 음료", s: "최소믈리에 · 한남" },
                ].map((c) => (
                  <div
                    key={c.t}
                    className="shrink-0 w-44 snap-start rounded-lg border border-black/10 dark:border-white/10 p-3"
                  >
                    <div className="text-[10px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold">{c.tag}</div>
                    <div className="text-sm font-semibold text-text-1 mt-1 line-clamp-2">{c.t}</div>
                    <div className="text-[11px] text-text-5 mt-1">{c.s}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-3 gap-2">
              {[
                { label: "받은 요청", count: 3, Icon: UserPlus },
                { label: "진행중", count: 2, Icon: Briefcase },
                { label: "찜한 제안", count: 7, Icon: Heart },
              ].map(({ label, count, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-3"
                >
                  <Icon size={14} className="text-text-6" />
                  <div className="text-lg font-bold text-text-1 mt-1 tabular-nums">{count}</div>
                  <div className="text-[10px] text-text-5">{label}</div>
                </div>
              ))}
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-1">최근 등록된 협업</h3>
                <span className="text-[11px] text-[#999f54]">전체보기</span>
              </div>
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {[
                  { t: "와인 페어링 시그니처 음료", a: "김바리스타", s: "모집중" },
                  { t: "브런치 메뉴 신규 라인업", a: "오베이커", s: "모집중" },
                  { t: "팝업 다이닝 3일간 콜라보", a: "정셰프", s: "예정" },
                ].map((c) => (
                  <li key={c.t} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm text-text-1 truncate">{c.t}</div>
                      <div className="text-[11px] text-text-5">{c.a}</div>
                    </div>
                    <span className="shrink-0 ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8]">
                      {c.s}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">B — 탐색 중심 (게스트·신규)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-3 space-y-3">
            <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-[#999f54] to-[#4a4d22]">
              <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-white gap-3">
                <h2 className="text-base font-bold">어떤 협업을 찾고 계세요?</h2>
                <div className="w-full max-w-xs relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none"
                  />
                  <input
                    readOnly
                    className="w-full h-9 pl-8 pr-3 rounded-full bg-white text-sm text-text-1 placeholder:text-text-6 outline-none"
                    placeholder="키워드·장소·이름"
                  />
                </div>
              </div>
            </div>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { I: UserPlus, l: "게스트" },
                  { I: FlaskConical, l: "테스트" },
                  { I: ChefHat, l: "개발" },
                  { I: Store, l: "팝업" },
                  { I: Handshake, l: "컨설팅" },
                ].map(({ I, l }) => (
                  <div key={l} className="flex flex-col items-center gap-1">
                    <span className="w-10 h-10 rounded-full bg-[#999f54]/10 flex items-center justify-center">
                      <I size={18} />
                    </span>
                    <span className="text-[10px] text-text-4">{l}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-1">이주의 추천 크리에이터</h3>
                <span className="text-[10px] text-text-6">큐레이션</span>
              </div>
              <div className="flex gap-4 overflow-x-auto -mx-4 px-4">
                {[
                  { n: "박셰프", d: "이탈리안 · 성수" },
                  { n: "이파티시에", d: "디저트 · 연남" },
                  { n: "정소믈리에", d: "와인 · 한남" },
                  { n: "김바리스타", d: "스페셜티 · 망원" },
                ].map((p) => (
                  <div key={p.n} className="shrink-0 flex flex-col items-center w-20">
                    <div className="w-16 h-16 rounded-full bg-[#999f54]/60" />
                    <div className="text-xs font-semibold text-text-1 mt-2">{p.n}</div>
                    <div className="text-[10px] text-text-6 text-center">{p.d}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-1 mb-3">HOT 협업</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { t: "시그니처 음료", l: 48 },
                  { t: "브런치 라인업", l: 32 },
                  { t: "팝업 다이닝", l: 27 },
                  { t: "디저트 코스", l: 21 },
                ].map((c) => (
                  <div
                    key={c.t}
                    className="rounded-lg border border-black/10 dark:border-white/10 p-2.5"
                  >
                    <div className="aspect-video rounded bg-[#999f54]/20 mb-2" />
                    <div className="text-xs font-semibold text-text-1 line-clamp-1">{c.t}</div>
                    <div className="flex items-center gap-1 text-[10px] text-text-6 mt-0.5">
                      <Heart size={10} />
                      {c.l}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-xl bg-[#999f54] text-[#F2F0DC] p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">나도 협업 등록하기</div>
                <div className="text-[10px] opacity-80 mt-0.5">3분이면 끝나요</div>
              </div>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">C — 가이드 + 발견 (콘텐츠 믹스)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-3 space-y-3">
            <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#999f54] to-[#4a4d22]">
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h2 className="text-xl font-bold">함께 만드는 F&B</h2>
                <p className="text-xs opacity-90 mt-0.5">크리에이터와 브랜드의 연결</p>
              </div>
            </div>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4 space-y-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none"
                />
                <input
                  readOnly
                  className="w-full h-9 pl-8 pr-3 rounded-full border border-black/10 dark:border-white/10 bg-background text-sm text-text-1 placeholder:text-text-6 outline-none"
                  placeholder="협업 검색"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["#팝업", "#콜라보", "#이탈리안", "#베이커리", "#소믈리에"].map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded-full bg-[#999f54]/10 text-[10px] text-[#4a4d22] dark:text-[#d4d8a8]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-1 mb-3">어떻게 시작하나요?</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 1, t: "프로필 등록", s: "내 스타일 소개" },
                  { n: 2, t: "협업 탐색", s: "맞는 파트너 찾기" },
                  { n: 3, t: "함께 만들기", s: "메시지로 진행" },
                ].map((s) => (
                  <div key={s.n} className="text-center">
                    <div className="w-8 h-8 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] inline-flex items-center justify-center text-xs font-bold">
                      {s.n}
                    </div>
                    <div className="text-xs font-semibold text-text-1 mt-1.5">{s.t}</div>
                    <div className="text-[10px] text-text-5">{s.s}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { I: UserPlus, l: "게스트" },
                  { I: FlaskConical, l: "테스트" },
                  { I: ChefHat, l: "개발" },
                  { I: Store, l: "팝업" },
                  { I: Handshake, l: "컨설팅" },
                ].map(({ I, l }) => (
                  <div key={l} className="flex flex-col items-center gap-1">
                    <span className="w-10 h-10 rounded-full bg-[#999f54]/10 flex items-center justify-center">
                      <I size={18} />
                    </span>
                    <span className="text-[10px] text-text-4">{l}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-1 mb-3">이번주 HOT 협업</h3>
              <div className="space-y-2">
                {[
                  { t: "시즈널 디저트 코스 공동개발", a: "박셰프 × 이파티시에", l: 48 },
                  { t: "와인 페어링 시그니처 음료", a: "최소믈리에 × 김바리스타", l: 32 },
                  { t: "팝업 다이닝 3일 콜라보", a: "정셰프 × 한브랜드", l: 27 },
                ].map((c) => (
                  <div
                    key={c.t}
                    className="flex items-center gap-3 p-2 rounded-lg border border-black/10 dark:border-white/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#999f54]/20 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text-1 truncate">{c.t}</div>
                      <div className="text-[10px] text-text-5 truncate">{c.a}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-text-6 shrink-0">
                      <Heart size={10} />
                      {c.l}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-1 mb-3">완료된 협업 이야기</h3>
              <div className="space-y-2">
                {[
                  { t: "정소믈리에 × 로컬 와이너리", d: "컬래버 디너 2회 연속 전석 매진" },
                  { t: "한브랜드 × 플랜트베이스", d: "런치 팝업 3일간 웨이팅 200+" },
                ].map((s) => (
                  <div
                    key={s.t}
                    className="flex gap-3 p-2 rounded-lg border border-black/10 dark:border-white/10"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#999f54]/20 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-1">{s.t}</div>
                      <div className="text-[10px] text-text-5 mt-0.5 line-clamp-2">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-6">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">CHAT LIST</div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">A — 현재 구조 개선 (메신저 표준 + 협업 제목 + unread 배지)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 overflow-hidden">
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {[
                { n: "박셰프", c: "시즈널 디저트 코스 공동개발", p: "다음주 화요일에 맞춰서 시제품 준비해보겠습니다.", t: "방금", u: 2, dot: true },
                { n: "이파티시에", c: "팝업 다이닝 3일간 콜라보", p: "장소 답사는 수요일 오후 어떠세요?", t: "11:42", u: 0, dot: false },
                { n: "최소믈리에", c: "와인 페어링 시그니처 음료", p: "네 확인했어요 감사합니다!", t: "어제", u: 0, dot: false },
              ].map((r) => (
                <li key={r.n} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative shrink-0">
                    <span className="w-12 h-12 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                      <User size={22} strokeWidth={1.75} />
                    </span>
                    {r.dot && (
                      <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[15px] font-semibold text-text-1 truncate">{r.n}</div>
                      <span className="shrink-0 text-[11px] text-text-6">{r.t}</span>
                    </div>
                    <div className="text-[11px] text-text-6 truncate mt-0.5">{r.c}</div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-[13px] text-text-5 truncate">{r.p}</div>
                      {r.u > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#999f54] text-[#F2F0DC] text-[10px] font-semibold inline-flex items-center justify-center">
                          {r.u}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">B — 협업 메타 상단 (협업 중심)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 overflow-hidden">
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {[
                { n: "박셰프", c: "시즈널 디저트 코스 공동개발", s: "진행중", sc: "emerald", p: "다음주 화요일에 맞춰서 시제품 준비해보겠습니다.", t: "방금", u: 2 },
                { n: "이파티시에", c: "팝업 다이닝 3일간 콜라보", s: "모집중", sc: "amber", p: "장소 답사는 수요일 오후 어떠세요?", t: "11:42", u: 0 },
                { n: "최소믈리에", c: "와인 페어링 시그니처 음료", s: "완료", sc: "zinc", p: "네 확인했어요 감사합니다!", t: "어제", u: 0 },
              ].map((r) => (
                <li key={r.n} className="flex flex-col gap-1.5 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-text-1 truncate">{r.c}</div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.sc === "emerald"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : r.sc === "amber"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-black/5 text-text-5 border-black/10 dark:bg-white/5 dark:border-white/10"
                      }`}
                    >
                      {r.s}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                      <User size={16} strokeWidth={1.75} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-sm font-semibold text-text-1 truncate">{r.n}</div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-text-6">{r.t}</span>
                          {r.u > 0 && (
                            <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#999f54] text-[#F2F0DC] text-[9px] font-semibold inline-flex items-center justify-center">
                              {r.u}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[12px] text-text-5 truncate mt-0.5">{r.p}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">C — 필터·검색 보강 (기존 구조 + 상단 UI)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 overflow-hidden">
            <div className="p-3 space-y-2 border-b border-black/5 dark:border-white/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-6 pointer-events-none" />
                <input
                  readOnly
                  className="w-full h-9 pl-8 pr-3 rounded-full bg-surface border border-black/10 dark:border-white/10 text-sm text-text-1 placeholder:text-text-6 outline-none"
                  placeholder="대화 검색"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
                {[
                  { l: "전체", active: true },
                  { l: "안읽음", active: false },
                  { l: "진행중", active: false },
                  { l: "완료", active: false },
                ].map((f) => (
                  <span
                    key={f.l}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
                      f.active
                        ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                        : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                    }`}
                  >
                    {f.l}
                  </span>
                ))}
              </div>
            </div>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {[
                { n: "박셰프", p: "다음주 화요일에 맞춰서 시제품 준비해보겠습니다.", t: "방금", u: 2 },
                { n: "이파티시에", p: "장소 답사는 수요일 오후 어떠세요?", t: "11:42", u: 0 },
                { n: "최소믈리에", p: "네 확인했어요 감사합니다!", t: "어제", u: 0 },
              ].map((r) => (
                <li key={r.n} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-12 h-12 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                    <User size={22} strokeWidth={1.75} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[15px] font-semibold text-text-1 truncate">{r.n}</div>
                      <span className="shrink-0 text-[11px] text-text-6">{r.t}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-[13px] text-text-5 truncate">{r.p}</div>
                      {r.u > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#999f54] text-[#F2F0DC] text-[10px] font-semibold inline-flex items-center justify-center">
                          {r.u}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">D — 섹션 그룹핑 (시간 축)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 overflow-hidden">
            {[
              {
                title: "오늘",
                items: [
                  { n: "박셰프", p: "다음주 화요일에 맞춰서 시제품 준비해보겠습니다.", t: "방금", u: 2 },
                  { n: "이파티시에", p: "장소 답사는 수요일 오후 어떠세요?", t: "11:42", u: 0 },
                ],
              },
              {
                title: "이번 주",
                items: [
                  { n: "최소믈리에", p: "네 확인했어요 감사합니다!", t: "화", u: 0 },
                ],
              },
              {
                title: "이전",
                items: [
                  { n: "오베이커", p: "그 건은 일정 다시 잡아볼게요", t: "3월 12일", u: 0 },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-text-6 tracking-wider uppercase">
                  {section.title}
                </div>
                <ul className="divide-y divide-black/5 dark:divide-white/5">
                  {section.items.map((r) => (
                    <li key={r.n} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-12 h-12 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                        <User size={22} strokeWidth={1.75} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-[15px] font-semibold text-text-1 truncate">{r.n}</div>
                          <span className="shrink-0 text-[11px] text-text-6">{r.t}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <div className="text-[13px] text-text-5 truncate">{r.p}</div>
                          {r.u > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#999f54] text-[#F2F0DC] text-[10px] font-semibold inline-flex items-center justify-center">
                              {r.u}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-6">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">
          FORM CONSISTENCY — collab 새 구조
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">현재 (작성자 3옵션)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">종류</label>
              <div className="flex flex-wrap gap-1.5">
                {["게스트", "테스트", "개발", "팝업", "컨설팅"].map((k, i) => (
                  <span
                    key={k}
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      i === 3
                        ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                        : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                    }`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">작성자</label>
              <div className="flex flex-wrap gap-1.5">
                {["이름", "소속", "둘 다"].map((a, i) => (
                  <span
                    key={a}
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      i === 0
                        ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                        : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                    }`}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">제목</label>
              <div className="h-9 rounded-lg border border-black/15 dark:border-white/15" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">설명</label>
              <div className="h-20 rounded-lg border border-black/15 dark:border-white/15" />
            </div>
            <div className="pt-2 flex gap-2">
              <div className="flex-1 py-2 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4 text-center">취소</div>
              <div className="flex-[2] py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold text-center">등록하기</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">새 안 — Step 1 · 프로필 구성 + 제안 내용</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-6">1 / 2 — 편집</span>
              <span className="text-[10px] text-text-6">미리보기 →</span>
            </div>

            <section>
              <h3 className="text-[11px] font-semibold text-text-5 tracking-wider mb-2">
                내 프로필 카드 구성
              </h3>
              <ul className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                {[
                  { l: "이름", v: "박셰프", fixed: true, on: true },
                  { l: "아바타", v: "프로필 사진", fixed: false, on: true },
                  { l: "소속", v: "성수 다이닝", fixed: false, on: false },
                  { l: "직함", v: "헤드셰프", fixed: false, on: true },
                  { l: "지역", v: "서울 성수", fixed: false, on: false },
                  { l: "키워드", v: "#이탈리안 #팝업", fixed: false, on: true },
                ].map((r) => (
                  <li key={r.l} className="flex items-center gap-3 py-2.5">
                    <div className="w-16 shrink-0 text-xs text-text-5">{r.l}</div>
                    <div className="flex-1 min-w-0 text-xs text-text-1 truncate">{r.v}</div>
                    {r.fixed ? (
                      <span className="shrink-0 text-[10px] text-text-6 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                        항상 공개
                      </span>
                    ) : (
                      <span
                        className={`shrink-0 w-8 h-4 rounded-full inline-flex items-center p-0.5 transition-colors ${
                          r.on ? "bg-[#999f54] justify-end" : "bg-black/20 dark:bg-white/20 justify-start"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-white" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-semibold text-text-5 tracking-wider">제안 내용</h3>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">종류</label>
                <div className="flex flex-wrap gap-1.5">
                  {["게스트", "테스트", "개발", "팝업", "컨설팅"].map((k, i) => (
                    <span
                      key={k}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        i === 3
                          ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                          : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                      }`}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">제목</label>
                <div className="h-9 rounded-lg border border-border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">설명</label>
                <div className="h-20 rounded-lg border border-border" />
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-5 px-2.5 py-1 rounded-full border border-dashed border-black/20 dark:border-white/20">
                    + 항목 추가
                  </span>
                </div>
              </div>
            </section>

            <div className="pt-2 flex gap-2">
              <div className="flex-1 py-2 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4 text-center">취소</div>
              <div className="flex-[2] py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold text-center inline-flex items-center justify-center gap-1">
                다음: 미리보기
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">새 안 — Step 2 · 미리보기</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-6">2 / 2 — 미리보기</span>
              <span className="text-[10px] text-text-6">← 편집으로</span>
            </div>

            <p className="text-xs text-text-5">
              이렇게 등록됩니다. 내용 확인 후 올려주세요.
            </p>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                  <User size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-1">박셰프</div>
                  <div className="text-[11px] text-text-6">헤드셰프</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["#이탈리안", "#팝업"].map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[10px] text-[#4a4d22] dark:text-[#d4d8a8]"
                  >
                    {k}
                  </span>
                ))}
              </div>
              <div className="h-px bg-black/5 dark:bg-white/5" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8]">
                    팝업
                  </span>
                </div>
                <div className="text-sm font-semibold text-text-1">
                  시즈널 디저트 코스 공동개발
                </div>
                <p className="text-xs text-text-5">
                  연말 시즌을 겨냥한 디저트 3-4종을 함께 개발할 파트너를 찾고 있어요. 매장 메뉴 편입 가능성도 있어요.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-text-4">
                ← 뒤로
              </span>
              <span className="px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold">
                등록하기
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-6">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">
          AUTHORING UI — 진입/구성 방식 조합
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">조합 1 — 템플릿 선택 → 2-step 폼</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-6">0 / 2 — 템플릿 선택</span>
            </div>
            <h3 className="text-sm font-semibold text-text-1">어떤 협업인가요?</h3>
            <p className="text-[11px] text-text-6 -mt-2">
              비슷한 유형을 고르면 기본 필드가 채워져요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { I: Store, t: "팝업 다이닝", d: "단기 이벤트 협업" },
                { I: ChefHat, t: "시즌 메뉴 개발", d: "공동 메뉴 기획" },
                { I: FlaskConical, t: "테스트·실험", d: "시제품 피드백" },
                { I: Handshake, t: "컨설팅", d: "전문가 매칭" },
              ].map(({ I, t, d }) => (
                <div
                  key={t}
                  className="rounded-lg border border-black/10 dark:border-white/10 p-3 hover:border-[#999f54] hover:bg-[#999f54]/5"
                >
                  <I size={16} className="text-[#999f54]" />
                  <div className="text-xs font-semibold text-text-1 mt-1.5">{t}</div>
                  <div className="text-[10px] text-text-6">{d}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-lg border border-dashed border-black/15 dark:border-white/15 p-3 text-center">
                <div className="text-xs font-semibold text-text-4">처음부터 작성</div>
                <div className="text-[10px] text-text-6 mt-0.5">자유 양식으로 시작</div>
              </div>
            </div>
            <div className="text-[10px] text-text-6 pt-1 border-t border-black/5 dark:border-white/5">
              선택 후 → "내 프로필 구성 + 제안 내용" 2-step 폼 (위 FORM CONSISTENCY 안과 동일)
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">조합 2 — AI 초안 → 2-step 편집</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-6">0 / 2 — AI 초안</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-1">간단히 설명해주세요</h3>
              <p className="text-[11px] text-text-6 mt-0.5">
                한두 줄만 쓰면 AI가 나머지를 초안으로 만들어줘요.
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-xs text-text-6 min-h-[64px]">
              예: 12월 둘째주에 성수 공간에서 디저트 팝업 같이 할 파티시에 찾아요
            </div>
            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold">
                <Sparkles size={14} />
                AI로 초안 생성
              </span>
            </div>

            <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#999f54]/15 text-[10px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold">
                <Sparkles size={11} />
                초안 완성 — 확인하고 수정해주세요
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">종류</label>
                <div className="flex flex-wrap gap-1.5">
                  {["게스트", "테스트", "개발", "팝업", "컨설팅"].map((k, i) => (
                    <span
                      key={k}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        i === 3
                          ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                          : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                      }`}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">제목</label>
                <div className="px-3 py-2 rounded-lg border border-border text-xs text-text-1">
                  성수 공간 팝업, 디저트 3종 함께 만들 파티시에 찾습니다
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">설명</label>
                <div className="px-3 py-2 rounded-lg border border-border text-xs text-text-1 leading-relaxed">
                  12월 둘째 주에 성수 매장에서 3일간 디저트 팝업을 준비하고 있어요. 시즈널 재료를 활용한 코스에 어울릴 디저트 3종을 함께 기획·제작할 파티시에를 찾습니다. 공동 개발 후 매장 정규 편입도 논의 가능합니다.
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] text-text-5 px-2.5 py-1 rounded-full border border-dashed border-black/20 dark:border-white/20">
                  <Sparkles size={11} />
                  다시 생성
                </span>
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold">
                  다음: 미리보기
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">조합 3 — 좌 폼 / 우 라이브 프리뷰 (≥1100px)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-6">편집 + 실시간 프리뷰</span>
              <span className="text-[10px] text-text-6">데스크탑 전용</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-text-5 tracking-wider">편집</div>
                <div>
                  <label className="block text-[11px] font-medium text-text-4 mb-1">종류</label>
                  <div className="flex flex-wrap gap-1">
                    {["게스트", "팝업", "개발"].map((k, i) => (
                      <span
                        key={k}
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          i === 1
                            ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                            : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                        }`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-4 mb-1">제목</label>
                  <div className="h-7 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-1 flex items-center">
                    디저트 팝업 공동 기획
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-4 mb-1">설명</label>
                  <div className="h-16 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-5 leading-snug">
                    시즈널 재료로 3종 디저트...
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-text-5 tracking-wider">미리보기</div>
                <div className="rounded-lg border border-black/10 dark:border-white/10 bg-surface p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                      <User size={12} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-text-1">박셰프</div>
                      <div className="text-[9px] text-text-6">헤드셰프</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8]">
                      팝업
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-text-1">
                    디저트 팝업 공동 기획
                  </div>
                  <p className="text-[10px] text-text-5 leading-snug">
                    시즈널 재료로 3종 디저트...
                  </p>
                </div>
                <div className="text-[9px] text-text-6 text-center">타이핑하면 즉시 반영</div>
              </div>
            </div>

            <div className="text-[10px] text-text-6 pt-2 border-t border-black/5 dark:border-white/5">
              모바일(&lt;1100px)에서는 조합 1 또는 2-step 폼으로 세로 단일 레이아웃
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 rounded-2xl border border-dashed border-[#999f54]/40 bg-[#999f54]/5 space-y-6">
        <div className="text-[11px] font-semibold text-text-5 tracking-wider">
          PHOTO ATTACHMENT — 사진 첨부 패턴
        </div>
        <p className="text-[11px] text-text-6 -mt-4">
          아래 3 패턴 중 하나를 각 조합(1/2/3) 의 "제안 내용" 섹션에 끼워넣을 수 있어.
        </p>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">패턴 α — 멀티 썸네일 그리드 (Airbnb·Instagram 스타일)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-4">사진</label>
              <span className="text-[10px] text-text-6">최대 5장 · 첫 사진이 커버</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="relative aspect-square rounded-lg bg-gradient-to-br from-[#c6a96b] to-[#8a6b3d] overflow-hidden">
                <span className="absolute top-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white">
                  커버
                </span>
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center"
                  aria-label="삭제"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="relative aspect-square rounded-lg bg-gradient-to-br from-[#d4a574] to-[#6b4423] overflow-hidden">
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center"
                  aria-label="삭제"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="relative aspect-square rounded-lg bg-gradient-to-br from-[#999f54] to-[#4a4d22] overflow-hidden">
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center"
                  aria-label="삭제"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="aspect-square rounded-lg border border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center gap-1 text-text-6">
                <ImagePlus size={18} />
                <span className="text-[10px]">추가</span>
              </div>
            </div>
            <p className="text-[10px] text-text-6">드래그로 순서 변경 · 첫 사진이 카드 커버로 사용</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">패턴 β — 커버 + 인라인 이미지 블록 (Notion·Medium 스타일)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">커버 이미지</label>
              <div className="relative aspect-[16/9] rounded-lg bg-gradient-to-br from-[#c6a96b] via-[#8a6b3d] to-[#4a2f13] overflow-hidden">
                <button
                  type="button"
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]"
                >
                  <ImagePlus size={10} />
                  변경
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-4 mb-1.5">설명</label>
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs text-text-1">시즈널 재료로 디저트 3종을 함께 개발할 파티시에를 찾고 있어요.</p>
                <div className="aspect-[3/2] rounded-md bg-gradient-to-br from-[#999f54]/40 to-[#4a4d22]/60" />
                <p className="text-xs text-text-1">작년 겨울 팝업에선 초콜릿 타르트가 가장 반응이 좋았어요.</p>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-text-5 px-2.5 py-1 rounded-full border border-dashed border-black/20 dark:border-white/20"
              >
                <ImagePlus size={11} />
                본문에 사진 추가
              </button>
            </div>
            <p className="text-[10px] text-text-6">스토리 중심 — 카드엔 커버만 노출, 상세에선 인라인 사진 포함</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">패턴 γ — 사진 먼저 (AI 맥락 파악 파이프라인)</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-1">사진부터 올려보세요</h3>
              <p className="text-[11px] text-text-6 mt-0.5">
                요리·공간·결과물 사진 한 장이면, AI가 맥락을 읽고 초안을 제안해요.
              </p>
            </div>
            <div className="relative aspect-[16/10] rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
              <ImagePlus size={28} className="text-text-6" />
              <div className="text-xs text-text-4 font-medium">사진 드래그하거나 클릭해서 업로드</div>
              <div className="text-[10px] text-text-6">JPG·PNG · 최대 10MB</div>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#999f54]/15 text-[10px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold mb-2">
                <Sparkles size={11} />
                사진 분석 완료 — "디저트 팝업 느낌"으로 보여요
              </div>
              <div className="rounded-lg border border-border p-3 text-xs text-text-1 leading-relaxed">
                이 사진을 기반으로 "겨울 시즈널 디저트 팝업 공동 기획" 초안을 만들어볼까요? 수정·교체도 가능해요.
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 text-xs text-text-4">
                  직접 작성
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-xs font-semibold">
                  <Sparkles size={12} />
                  초안 생성
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-text-6">조합 3 + α — 데스크탑 라이브 프리뷰에 커버 사진 반영</div>
          <div className="rounded-xl bg-background border border-black/10 dark:border-white/10 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-text-5 tracking-wider">편집</div>
                <div>
                  <label className="block text-[11px] font-medium text-text-4 mb-1">사진</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="relative aspect-square rounded-md bg-gradient-to-br from-[#c6a96b] to-[#8a6b3d]">
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold px-1 py-0 rounded bg-black/60 text-white">
                        커버
                      </span>
                    </div>
                    <div className="aspect-square rounded-md bg-gradient-to-br from-[#d4a574] to-[#6b4423]" />
                    <div className="aspect-square rounded-md border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center">
                      <Plus size={14} className="text-text-6" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-4 mb-1">제목</label>
                  <div className="h-7 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-1 flex items-center">
                    디저트 팝업 공동 기획
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-text-5 tracking-wider">미리보기</div>
                <div className="rounded-lg border border-black/10 dark:border-white/10 bg-surface overflow-hidden">
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#c6a96b] to-[#8a6b3d]" />
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center">
                        <User size={10} strokeWidth={1.75} />
                      </span>
                      <div className="text-[10px] font-semibold text-text-1">박셰프</div>
                    </div>
                    <div className="text-[11px] font-semibold text-text-1">디저트 팝업 공동 기획</div>
                  </div>
                </div>
                <div className="text-[9px] text-text-6 text-center">사진 · 타이핑 모두 즉시 반영</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
