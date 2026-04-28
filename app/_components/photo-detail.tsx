"use client";

import { ArrowLeft, CalendarClock, MapPin, User, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProfileModal from "./profile-modal";

export type PhotoDetailParticipant = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

export type PhotoDetailItem = {
  id: string;
  kind: string;
  title: string;
  host: string;
  hostId: string | null;
  period: string;
  location: string;
  desc: string;
  images: string[];
  participants: PhotoDetailParticipant[];
};

export default function PhotoDetail({
  item,
  backHref,
}: {
  item: PhotoDetailItem;
  backHref: string;
}) {
  const hero = item.images[0] ?? null;
  const rest = item.images.slice(1);
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface">
      <div className="relative h-[40vh] w-full bg-black/5 dark:bg-white/5">
        {hero && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hero}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
        <Link
          href={backHref}
          aria-label="뒤로"
          className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ArrowLeft size={18} />
        </Link>
        {item.kind && (
          <span className="absolute top-4 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-black/55 text-[11px] text-white backdrop-blur-sm">
            {item.kind}
          </span>
        )}
      </div>

      <main className="flex-1 px-5 pt-5 pb-24 max-w-xl w-full mx-auto">
        <h1 className="text-xl font-bold text-text-1 leading-snug">
          {item.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-xs text-text-4">
          <Users size={14} className="shrink-0 text-[#999f54]" />
          <button
            type="button"
            onClick={() =>
              item.hostId && setViewProfileUserId(item.hostId)
            }
            disabled={!item.hostId}
            className="truncate hover:underline disabled:no-underline disabled:cursor-default"
          >
            {item.host}
          </button>
        </div>

        {(item.period || item.location) && (
          <div className="mt-4 flex flex-col gap-1.5 text-xs text-text-5">
            {item.period && (
              <span className="inline-flex items-center gap-2">
                <CalendarClock size={14} className="shrink-0" />
                <span>{item.period}</span>
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="shrink-0" />
                <span>{item.location}</span>
              </span>
            )}
          </div>
        )}

        {item.desc && (
          <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5">
            <h2 className="text-xs font-semibold text-text-4 mb-2">협업 소개</h2>
            <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
              {item.desc}
            </p>
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5">
            <h2 className="text-xs font-semibold text-text-4 mb-2">사진</h2>
            <ul className="grid grid-cols-2 gap-2">
              {rest.map((url, i) => (
                <li
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.participants.length > 0 && (
          <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5">
            <h2 className="text-xs font-semibold text-text-4 mb-2">
              참여자 {item.participants.length}
            </h2>
            <ul className="flex flex-wrap gap-x-1 gap-y-2">
              {item.participants.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setViewProfileUserId(p.id)}
                    className="inline-flex items-center gap-2 cursor-pointer rounded-full -m-1 p-1 pr-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                      {p.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="text-xs font-semibold text-text-1 truncate max-w-[140px]">
                      {p.nickname}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />
    </div>
  );
}
