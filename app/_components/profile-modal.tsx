"use client";

import { Briefcase, GraduationCap, MapPin, Medal, User, Utensils, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  nickname: string | null;
  name: string | null;
  role: string | null;
  affiliation: string | null;
  job_title: string | null;
  region: string | null;
  avatar_url: string | null;
  keywords: string[] | null;
};

type Career = { id: string; start_ym: string; end_ym: string | null; title: string; body: string | null };
type Award = { id: string; received_ym: string; title: string; body: string | null };
type Education = { id: string; graduated_ym: string; title: string; body: string | null };
type Menu = { id: string; image_url: string; title: string; body: string | null; position: number };
type Photo = { id: string; image_url: string; position: number };
type Section = { kind: string; position: number; visible: boolean };

function formatYm(ym: string | null) {
  if (!ym) return "현재";
  return ym.replace("-", ".");
}

export default function ProfileModal({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setProfile(null);
    setSections([]);
    setCareers([]);
    setAwards([]);
    setEducations([]);
    setMenus([]);
    setPhotos([]);
    setLoading(true);

    const supabase = createClient();
    (async () => {
      const [p, s, c, a, e, m, ph] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, nickname, name, role, affiliation, job_title, region, avatar_url, keywords",
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("profile_sections")
          .select("kind, position, visible")
          .eq("profile_id", userId)
          .eq("visible", true)
          .order("position"),
        supabase
          .from("profile_careers")
          .select("id, start_ym, end_ym, title, body")
          .eq("profile_id", userId)
          .order("start_ym", { ascending: false }),
        supabase
          .from("profile_awards")
          .select("id, received_ym, title, body")
          .eq("profile_id", userId)
          .order("received_ym", { ascending: false }),
        supabase
          .from("profile_educations")
          .select("id, graduated_ym, title, body")
          .eq("profile_id", userId)
          .order("graduated_ym", { ascending: false }),
        supabase
          .from("profile_menus")
          .select("id, image_url, title, body, position")
          .eq("profile_id", userId)
          .order("position"),
        supabase
          .from("profile_photos")
          .select("id, image_url, position")
          .eq("profile_id", userId)
          .order("position"),
      ]);

      if (p.data) setProfile(p.data as Profile);
      if (s.data) setSections(s.data as Section[]);
      if (c.data) setCareers(c.data as Career[]);
      if (a.data) setAwards(a.data as Award[]);
      if (e.data) setEducations(e.data as Education[]);
      if (m.data) setMenus(m.data as Menu[]);
      if (ph.data) setPhotos(ph.data as Photo[]);
      setLoading(false);
    })();
  }, [userId]);

  if (!userId) return null;

  const showCareer =
    sections.find((s) => s.kind === "career") && careers.length > 0;
  const showAwards =
    sections.find((s) => s.kind === "awards") && awards.length > 0;
  const showStats =
    sections.find((s) => s.kind === "stats") && educations.length > 0;
  const showMenus =
    sections.find((s) => s.kind === "menus") && menus.length > 0;
  const showPhotos =
    sections.find((s) => s.kind === "photos") && photos.length > 0;

  const orderedSections = sections
    .filter((s) => {
      if (s.kind === "career") return showCareer;
      if (s.kind === "awards") return showAwards;
      if (s.kind === "stats") return showStats;
      if (s.kind === "menus") return showMenus;
      if (s.kind === "photos") return showPhotos;
      return false;
    })
    .map((s) => s.kind);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90dvh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10">
          <h2 className="text-sm font-semibold text-text-1">프로필</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
          {loading && !profile ? (
            <p className="text-xs text-text-5 text-center py-8">불러오는 중...</p>
          ) : !profile ? (
            <p className="text-xs text-text-5 text-center py-8">
              프로필을 찾을 수 없어요.
            </p>
          ) : (
            <>
              {/* 명함 헤더 */}
              <section className="flex items-center gap-4">
                <span className="shrink-0 w-16 h-16 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] inline-flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={28} strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  {profile.nickname && (
                    <h3 className="text-lg font-bold text-text-1 truncate">
                      {profile.nickname}
                    </h3>
                  )}
                  <div className="flex items-baseline gap-2 min-w-0">
                    {profile.name && (
                      <span className="text-sm text-text-3 truncate">
                        {profile.name}
                      </span>
                    )}
                    {profile.role && (
                      <span className="text-xs text-text-5 truncate">
                        {profile.role}
                      </span>
                    )}
                  </div>
                  {profile.affiliation && (
                    <p className="text-xs text-text-5 truncate">
                      {[profile.affiliation, profile.job_title]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {profile.region && (
                    <p className="text-[11px] text-text-6 inline-flex items-center gap-1 truncate">
                      <MapPin size={11} className="shrink-0" />
                      {profile.region}
                    </p>
                  )}
                </div>
              </section>

              {/* 키워드 */}
              {profile.keywords && profile.keywords.length > 0 && (
                <section>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.keywords.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] text-xs"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {orderedSections.map((kind) => {
                if (kind === "career") {
                  return (
                    <section key={kind}>
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-text-1 mb-2">
                        <Briefcase size={14} className="text-[#999f54]" />
                        경력
                      </h4>
                      <ul className="space-y-3 text-sm">
                        {careers.map((c) => (
                          <li key={c.id} className="flex gap-3 items-baseline">
                            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
                              {formatYm(c.start_ym)} ~ {formatYm(c.end_ym)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-text-1 font-medium">
                                {c.title}
                              </div>
                              {c.body && (
                                <p className="mt-0.5 text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                                  {c.body}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }
                if (kind === "awards") {
                  return (
                    <section key={kind}>
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-text-1 mb-2">
                        <Medal size={14} className="text-[#999f54]" />
                        수상
                      </h4>
                      <ul className="space-y-3 text-sm">
                        {awards.map((a) => (
                          <li key={a.id} className="flex gap-3 items-baseline">
                            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
                              {formatYm(a.received_ym)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-text-1 font-medium">
                                {a.title}
                              </div>
                              {a.body && (
                                <p className="mt-0.5 text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                                  {a.body}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }
                if (kind === "stats") {
                  return (
                    <section key={kind}>
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-text-1 mb-2">
                        <GraduationCap size={14} className="text-[#999f54]" />
                        학력
                      </h4>
                      <ul className="space-y-3 text-sm">
                        {educations.map((e) => (
                          <li key={e.id} className="flex gap-3 items-baseline">
                            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
                              {formatYm(e.graduated_ym)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-text-1 font-medium">
                                {e.title}
                              </div>
                              {e.body && (
                                <p className="mt-0.5 text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                                  {e.body}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }
                if (kind === "menus") {
                  return (
                    <section key={kind}>
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-text-1 mb-2">
                        <Utensils size={14} className="text-[#999f54]" />
                        시그니처 메뉴
                      </h4>
                      <ul className="grid grid-cols-2 gap-3">
                        {menus.map((m) => (
                          <li
                            key={m.id}
                            className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-surface"
                          >
                            <div className="aspect-[4/3] bg-black/5 dark:bg-white/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.image_url}
                                alt={m.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5">
                              <div className="text-xs font-semibold text-text-1 truncate">
                                {m.title}
                              </div>
                              {m.body && (
                                <p className="mt-0.5 text-[11px] text-text-5 line-clamp-2">
                                  {m.body}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }
                if (kind === "photos") {
                  return (
                    <section key={kind}>
                      <h4 className="text-sm font-semibold text-text-1 mb-2">사진</h4>
                      <ul className="grid grid-cols-3 gap-1.5">
                        {photos.map((p) => (
                          <li
                            key={p.id}
                            className="aspect-square rounded-md bg-black/5 dark:bg-white/5 overflow-hidden"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }
                return null;
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
