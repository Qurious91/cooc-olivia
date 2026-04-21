"use client";

import { ArrowLeft, Handshake, Pencil, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import PeriodPicker, { periodFromColumns, periodToColumns } from "../../period-picker";
import { createCoocRequestChat } from "../../data/chats";
import { createClient } from "@/lib/supabase/client";

const AUTHORS = ["소속", "이름", "둘 다"] as const;

type CollabKindRow = {
  key: string;
  label: string;
  position: number;
};

const OPTIONAL_FIELDS = [
  { key: "period", label: "기간", placeholder: "예) 2026.05.15 또는 2026.05.15 – 2026.05.20" },
  { key: "location", label: "장소", placeholder: "예) 서울 성수" },
] as const;

type OptKey = (typeof OPTIONAL_FIELDS)[number]["key"];

export default function NewCollab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const [kinds, setKinds] = useState<CollabKindRow[]>([]);
  const [kind, setKind] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("collab_kinds")
        .select("key, label, position")
        .order("position");
      if (data && data.length) {
        setKinds(data as CollabKindRow[]);
        setKind((prev) => prev || (data[0] as CollabKindRow).label);
      }
    })();
  }, []);
  const [author, setAuthor] = useState<(typeof AUTHORS)[number]>("이름");
  const [profile, setProfile] = useState({ name: "", affiliation: "" });
  const [title, setTitle] = useState("");
  const hasAffiliation = profile.affiliation.trim().length > 0;
  const visibleAuthors = hasAffiliation
    ? AUTHORS
    : (AUTHORS.filter((a) => a === "이름") as unknown as typeof AUTHORS);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from("profiles")
        .select("name, affiliation")
        .eq("id", user.id)
        .single();
      if (row) {
        setProfile({
          name: row.name ?? "",
          affiliation: row.affiliation ?? "",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasAffiliation && author !== "이름") setAuthor("이름");
  }, [hasAffiliation, author]);

  useEffect(() => {
    if (!editId) return;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("collabs")
        .select(
          "author, title, description, period_start, period_end, period_start_time, period_end_time, location, collab_kinds(label)",
        )
        .eq("id", editId)
        .single();
      if (!data) return;
      const row = data as any;
      if (row.collab_kinds?.label) setKind(row.collab_kinds.label);
      if (row.author) setAuthor(row.author);
      setTitle(row.title ?? "");
      setDesc(row.description ?? "");
      const period = periodFromColumns({
        period_start: row.period_start,
        period_end: row.period_end,
        period_start_time: row.period_start_time,
        period_end_time: row.period_end_time,
      });
      const next: Partial<Record<OptKey, string>> = {};
      if (period) next.period = period;
      if (row.location) next.location = row.location;
      setExtras(next);
    })();
  }, [editId]);

  const authorPreview =
    author === "이름"
      ? profile.name
      : author === "소속"
      ? profile.affiliation
      : [profile.affiliation, profile.name].filter(Boolean).join(" · ");
  const [desc, setDesc] = useState("");
  const [extras, setExtras] = useState<Partial<Record<OptKey, string>>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [coocConfirmOpen, setCoocConfirmOpen] = useState(false);

  const addedKeys = OPTIONAL_FIELDS.filter((f) => f.key in extras);
  const availableFields = OPTIONAL_FIELDS.filter((f) => !(f.key in extras));

  const addField = (key: OptKey) => {
    setExtras((prev) => ({ ...prev, [key]: "" }));
    if (availableFields.length <= 1) setPickerOpen(false);
  };
  const removeField = (key: OptKey) => {
    setExtras((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  const patchField = (key: OptKey, value: string) =>
    setExtras((prev) => ({ ...prev, [key]: value }));

  const canSubmit = title.trim().length > 0 && desc.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const kindKey = kinds.find((k) => k.label === kind)?.key;
    if (!kindKey) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const periodCols = periodToColumns(extras.period?.trim() || "");
    const payload = {
      kind: kindKey,
      author,
      title: title.trim(),
      description: desc.trim(),
      ...periodCols,
      location: extras.location?.trim() || null,
    };
    if (isEdit && editId) {
      const { error } = await supabase
        .from("collabs")
        .update(payload)
        .eq("id", editId);
      if (error) return;
    } else {
      const { error } = await supabase
        .from("collabs")
        .insert({ author_id: user.id, ...payload });
      if (error) return;
    }
    router.push("/projects");
  };

  const confirmRequestCooc = () => {
    const room = createCoocRequestChat();
    setCoocConfirmOpen(false);
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-10 bg-surface border-b border-black/10 dark:border-white/10 flex items-center gap-1.5 px-3 py-1.5">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/home");
          }}
          aria-label="뒤로"
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          {isEdit ? (
            <Pencil size={14} className="text-[#999f54]" />
          ) : (
            <Handshake size={14} className="text-[#999f54]" />
          )}
          <h1 className="text-[13px] font-semibold text-text-1">
            {isEdit ? "제안 수정" : "같이 하고 싶어요"}
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24 max-w-xl w-full mx-auto">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              종류 <span aria-hidden className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setKind(k.label)}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap border ${
                    kind === k.label
                      ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                      : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              작성자 <span aria-hidden className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {visibleAuthors.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAuthor(a)}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap border ${
                    author === a
                      ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                      : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {profile.name ? (
              <p className="mt-1.5 text-[11px] text-text-6">
                상대에겐 이렇게 보여요 · <span className="text-text-4 font-medium">{authorPreview}</span>
              </p>
            ) : (
              <Link
                href="/profile"
                className="mt-1.5 inline-block text-[11px] text-[#999f54] hover:underline"
              >
                온보딩을 완료해주세요
              </Link>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              제목 <span aria-hidden className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
              placeholder="예) 시즈널 디저트 코스 공동개발"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              설명 <span aria-hidden className="text-red-500">*</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              aria-required="true"
              rows={5}
              placeholder="어떤 협업인지, 기대하는 결과물은 무엇인지 적어주세요."
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] resize-y"
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={availableFields.length === 0}
                className="inline-flex items-center gap-1 text-[11px] text-text-5 px-2.5 py-1 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> 항목 추가
              </button>
            </div>
          </div>

          {addedKeys.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-text-4">{f.label}</label>
                <button
                  type="button"
                  onClick={() => removeField(f.key)}
                  className="inline-flex items-center gap-0.5 text-[11px] text-text-6 hover:text-red-500"
                  aria-label={`${f.label} 제거`}
                >
                  <X size={12} /> 제거
                </button>
              </div>
              {f.key === "period" ? (
                <PeriodPicker
                  value={extras[f.key] ?? ""}
                  onChange={(v) => patchField(f.key, v)}
                />
              ) : (
                <input
                  type="text"
                  value={extras[f.key] ?? ""}
                  onChange={(e) => patchField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
                />
              )}
            </div>
          ))}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/home");
              }}
              className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4 text-center"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEdit ? "수정하기" : "등록하기"}
            </button>
          </div>

          {!isEdit && (
            <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setCoocConfirmOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#999f54]/10 dark:bg-[#999f54]/20 hover:bg-[#999f54]/20 text-left"
              >
                <Sparkles size={20} className="text-text-6 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-4">COOC에 요청하기</div>
                  <p className="text-[11px] text-text-6 mt-0.5">
                    아직 계획이 추상적이라면 COOC 에이전시에 맡겨보세요!
                  </p>
                </div>
              </button>
            </div>
          )}
        </form>
      </main>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="항목 추가"
        size="sm"
      >
        {availableFields.length === 0 ? (
          <p className="text-xs text-text-5">추가할 수 있는 항목을 모두 추가했어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableFields.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => addField(f.key)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-surface text-left hover:border-[#999f54] hover:bg-[#999f54]/5 transition-colors"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-text-5">
                  <Plus size={14} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-2">{f.label}</span>
                  <span className="block text-[11px] text-text-6 truncate">{f.placeholder}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={coocConfirmOpen}
        onClose={() => setCoocConfirmOpen(false)}
        title="COOC에 요청하기"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-3 leading-relaxed">
            COOC와의 채팅으로 바로 연결됩니다.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCoocConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
            >
              취소
            </button>
            <button
              type="button"
              onClick={confirmRequestCooc}
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
