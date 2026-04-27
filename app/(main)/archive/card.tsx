import { CalendarClock, MapPin } from "lucide-react";
import Link from "next/link";
import type { ArchiveItem } from "./data";

export function ArchiveCard({
  item,
  className = "",
  imageClassName = "aspect-[4/3]",
}: {
  item: ArchiveItem;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <li
      className={`isolate rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm overflow-hidden ${className}`}
    >
      <Link href={`/archive/${item.id}`} className="block">
        <div className={`${imageClassName} bg-black/5 dark:bg-white/5 relative`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm">
            {item.kind}
          </span>
        </div>
        <div className="p-3">
          <div className="text-sm font-semibold text-text-1 line-clamp-2 leading-snug min-h-[2.5rem]">
            {item.title}
          </div>
          <div className="mt-1 text-[11px] text-text-5 truncate">
            {item.host}
          </div>
          <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-text-6">
            <span className="inline-flex items-center gap-1 min-w-0">
              <CalendarClock size={10} className="shrink-0" />
              <span className="truncate">{item.period}</span>
            </span>
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
