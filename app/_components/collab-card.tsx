"use client";

import { CalendarClock, ChevronDown, MapPin, User } from "lucide-react";
import type { ReactNode } from "react";

export type CollabCardItem = {
  id: string;
  authorId?: string;
  authorNickname?: string;
  authorAvatarUrl?: string | null;
  kind: string;
  title: string;
  description?: string;
  period?: string;
  location?: string;
  photos?: string[];
};

type Props = {
  item: CollabCardItem;
  expanded: boolean;
  onToggle: () => void;
  onAuthorClick?: () => void;
  /** 카드 우상단에 노출할 콘텐츠 (좋아요 버튼 / 참여자 수 / 역할 칩 등) */
  rightTop?: ReactNode;
  /** 펼친 영역의 마지막에 들어갈 액션들 (참여하기 / 수정·삭제 / 완료하기 등) */
  expandedActions?: ReactNode;
  className?: string;
  /** 딥링크 스크롤 타겟용 DOM id */
  domId?: string;
};

export default function CollabCard({
  item,
  expanded,
  onToggle,
  onAuthorClick,
  rightTop,
  expandedActions,
  className = "",
  domId,
}: Props) {
  return (
    <li
      id={domId}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest(
            "button, a, input, [role='button']",
          )
        )
          return;
        onToggle();
      }}
      className={`rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-4 cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {item.authorNickname && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAuthorClick?.();
                }}
                className="flex items-center gap-2 min-w-0 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] -ml-1 pl-1 pr-2 py-0.5 transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] inline-flex items-center justify-center overflow-hidden">
                  {item.authorAvatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.authorAvatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={14} strokeWidth={1.75} />
                  )}
                </span>
                <span className="text-xs text-text-3 font-medium truncate">
                  {item.authorNickname}
                </span>
              </button>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]">
              {item.kind}
            </span>
          </div>
          <div className="mt-2 text-lg font-semibold text-text-1 truncate">
            {item.title}
          </div>
          {(item.period || item.location) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-6">
              {item.period && (
                <span className="inline-flex items-center gap-1 min-w-0">
                  <CalendarClock size={11} className="shrink-0" />
                  <span className="truncate">{item.period}</span>
                </span>
              )}
              {item.location && (
                <span className="inline-flex items-center gap-1 min-w-0">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
              )}
            </div>
          )}
        </div>
        {rightTop && <div className="shrink-0">{rightTop}</div>}
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "접기" : "자세히"}
          className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]"
        >
          자세히
          <ChevronDown
            size={12}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-3"
        >
          {item.description && (
            <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
              {item.description}
            </p>
          )}
          {item.photos && item.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {item.photos.map((url, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="aspect-square rounded-md bg-black/5 dark:bg-white/5 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          {expandedActions}
        </div>
      )}
    </li>
  );
}
