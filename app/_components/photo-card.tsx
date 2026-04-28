import { CalendarClock, ImagePlus, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type PhotoCardProps = {
  image?: string | null;
  kind?: string;
  title: string;
  host?: string;
  period?: string;
  location?: string;
  /** 카드 전체를 감쌀 링크. 미지정 시 정적 카드 */
  href?: string;
  /** 사진 우상단에 노출할 콘텐츠 (예: 상태 배지) */
  rightTopBadge?: ReactNode;
  /** 카드 luminence 폼팩터 조절 */
  className?: string;
  imageClassName?: string;
};

export default function PhotoCard({
  image,
  kind,
  title,
  host,
  period,
  location,
  href,
  rightTopBadge,
  className = "",
  imageClassName = "aspect-[4/3]",
}: PhotoCardProps) {
  const inner = (
    <>
      <div
        className={`${imageClassName} bg-black/5 dark:bg-white/5 relative`}
      >
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-6">
            <ImagePlus size={28} />
          </div>
        )}
        {kind && (
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm">
            {kind}
          </span>
        )}
        {rightTopBadge && (
          <span className="absolute top-2 right-2">{rightTopBadge}</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-sm font-semibold text-text-1 line-clamp-2 leading-snug min-h-[2.5rem]">
          {title}
        </div>
        {host && (
          <div className="mt-1 text-[11px] text-text-5 truncate">{host}</div>
        )}
        {(period || location) && (
          <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-text-6">
            {period && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <CalendarClock size={10} className="shrink-0" />
                <span className="truncate">{period}</span>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <li
      className={`isolate rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {href ? (
        <Link href={href} className="flex-1 flex flex-col">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}
