"use client";

import { ArrowLeft, Handshake, Paperclip, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Modal from "../../modal";
import PeriodPicker, { periodFromColumns, periodToColumns } from "../../period-picker";
import { createClient } from "@/lib/supabase/client";

type AuthorMode = "닉네임" | "이름";

type CollabKindRow = {
  key: string;
  label: string;
  position: number;
};

// 기간/장소는 필수 입력으로 폼에 항상 노출. photos만 옵션으로 토글.
const OPTIONAL_FIELDS = [
  { key: "photos", label: "사진", placeholder: "협업과 관련된 사진을 첨부해요" },
] as const;

type OptKey = (typeof OPTIONAL_FIELDS)[number]["key"];

export default function NewCollabPage() {
  return (
    <Suspense fallback={null}>
      <NewCollab />
    </Suspense>
  );
}

function NewCollab() {
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
  const [profile, setProfile] = useState({ nickname: "", name: "" });
  const [authorMode, setAuthorMode] = useState<AuthorMode>("닉네임");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from("profiles")
        .select("nickname, name")
        .eq("id", user.id)
        .single();
      if (row) {
        setProfile({
          nickname: row.nickname ?? "",
          name: row.name ?? "",
        });
      }
    })();
  }, []);

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
      if (row.author === "이름" || row.author === "닉네임") {
        setAuthorMode(row.author);
      }
      setTitle(row.title ?? "");
      setDesc(row.description ?? "");
      const periodValue = periodFromColumns({
        period_start: row.period_start,
        period_end: row.period_end,
        period_start_time: row.period_start_time,
        period_end_time: row.period_end_time,
      });
      if (periodValue) setPeriod(periodValue);
      if (row.location) setLocation(row.location);

      const { data: photoRows } = await supabase
        .from("collab_photos")
        .select("id, image_url")
        .eq("collab_id", editId)
        .order("position", { ascending: true });
      if (photoRows && photoRows.length > 0) {
        setExistingPhotos(
          photoRows as { id: string; image_url: string }[],
        );
        setExtras((prev) => ({ ...prev, photos: "" }));
      }
    })();
  }, [editId]);

  const [desc, setDesc] = useState("");
  const [period, setPeriod] = useState("");
  const [location, setLocation] = useState("");
  const [extras, setExtras] = useState<Partial<Record<OptKey, string>>>({});
  const [collabPhotos, setCollabPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<
    { id: string; image_url: string }[]
  >([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (key === "photos") {
      setCollabPhotos([]);
      // 기존 사진은 추가 항목 통째로 제거 시 모두 삭제 표시
      setRemovedPhotoIds(new Set(existingPhotos.map((p) => p.id)));
    }
  };
  const patchField = (key: OptKey, value: string) =>
    setExtras((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    title.trim().length > 0 &&
    desc.trim().length > 0 &&
    period.trim().length > 0 &&
    location.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    const kindKey = kinds.find((k) => k.label === kind)?.key;
    if (!kindKey) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const periodCols = periodToColumns(period.trim());
      const payload = {
        kind: kindKey,
        author: authorMode,
        title: title.trim(),
        description: desc.trim(),
        ...periodCols,
        location: location.trim(),
      };
      let collabId = editId ?? null;
      if (isEdit && editId) {
        const { error } = await supabase
          .from("collabs")
          .update(payload)
          .eq("id", editId);
        if (error) return;
      } else {
        const { data: inserted, error } = await supabase
          .from("collabs")
          .insert({ author_id: user.id, ...payload })
          .select("id")
          .single();
        if (error || !inserted) return;
        collabId = inserted.id as string;
      }

      if (!collabId) {
        router.push("/projects");
        return;
      }

      // 1) 삭제 표시된 기존 사진들 DB에서 제거 (storage 객체는 분리된 정리 작업으로 처리)
      if (removedPhotoIds.size > 0) {
        await supabase
          .from("collab_photos")
          .delete()
          .in("id", [...removedPhotoIds]);
      }

      // 2) 새로 첨부된 파일 storage 업로드 + collab_photos insert
      if (collabPhotos.length > 0) {
        const remainingExistingCount = existingPhotos.filter(
          (p) => !removedPhotoIds.has(p.id),
        ).length;
        const uploadedUrls = await Promise.all(
          collabPhotos.map(async (file) => {
            const ext = file.name.split(".").pop() || "bin";
            const filename = `${crypto.randomUUID()}.${ext}`;
            const path = `${user.id}/${collabId}/${filename}`;
            const { error: uploadError } = await supabase.storage
              .from("collab")
              .upload(path, file, { upsert: false });
            if (uploadError) return null;
            const { data: pub } = supabase.storage
              .from("collab")
              .getPublicUrl(path);
            return pub.publicUrl;
          }),
        );
        const insertRows = uploadedUrls
          .map((url, i) =>
            url
              ? {
                  collab_id: collabId,
                  image_url: url,
                  position: remainingExistingCount + i,
                }
              : null,
          )
          .filter((r): r is NonNullable<typeof r> => !!r);
        if (insertRows.length > 0) {
          await supabase.from("collab_photos").insert(insertRows);
        }
      }

      router.push("/projects");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface">
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
              작성자 표시
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(["닉네임", "이름"] as const).map((mode) => {
                const value = mode === "닉네임" ? profile.nickname : profile.name;
                const disabled = !value;
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={disabled}
                    onClick={() => setAuthorMode(mode)}
                    className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap border ${
                      authorMode === mode
                        ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                        : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
            {(() => {
              const current =
                authorMode === "닉네임" ? profile.nickname : profile.name;
              if (current) {
                return (
                  <p className="mt-1.5 text-sm text-text-2 font-medium">
                    {current}
                  </p>
                );
              }
              return (
                <Link
                  href="/profile"
                  className="mt-1.5 inline-block text-[11px] text-[#999f54] hover:underline"
                >
                  {authorMode}이 없어요. 프로필에서 등록해주세요
                </Link>
              );
            })()}
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
              placeholder="협업 제목"
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
              placeholder="협업 내용을 자유롭게"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              기간 <span aria-hidden className="text-red-500">*</span>
            </label>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              장소 <span aria-hidden className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              aria-required="true"
              placeholder="예) 서울 성수"
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={availableFields.length === 0}
              className="inline-flex items-center gap-1 text-[11px] text-text-5 px-2.5 py-1 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> 항목 추가
            </button>
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
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-lg border-2 border-dashed border-black/15 dark:border-white/15 cursor-pointer hover:border-[#999f54] hover:bg-[#999f54]/5 text-center">
                  <Upload size={20} className="text-text-5" />
                  <span className="text-xs font-medium text-text-3">
                    클릭해서 사진 선택
                  </span>
                  <span className="text-[10px] text-text-6">
                    JPG, PNG, WebP (여러 장 가능)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const picked = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                      if (picked.length === 0) return;
                      setCollabPhotos((prev) => [...prev, ...picked]);
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                </label>
                {(existingPhotos.some((p) => !removedPhotoIds.has(p.id)) ||
                  collabPhotos.length > 0) && (
                  <ul className="rounded-lg border border-border divide-y divide-black/5 dark:divide-white/10 overflow-hidden">
                    {existingPhotos
                      .filter((p) => !removedPhotoIds.has(p.id))
                      .map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-10 h-10 object-cover rounded shrink-0"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block text-[12px] text-text-2 truncate">
                              기존 사진
                            </span>
                            <span className="block text-[10px] text-text-6 truncate">
                              {p.image_url.split("/").slice(-1)[0]}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRemovedPhotoIds(
                                (prev) => new Set([...prev, p.id]),
                              )
                            }
                            aria-label="삭제"
                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-text-5 hover:text-[#c0392b]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    {collabPhotos.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        <Paperclip size={14} className="text-text-5 shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[12px] text-text-2 truncate">
                            {file.name}
                          </span>
                          <span className="block text-[10px] text-text-6">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCollabPhotos((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          aria-label="삭제"
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-text-5 hover:text-[#c0392b]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
              disabled={!canSubmit || submitting}
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? isEdit
                  ? "수정 중..."
                  : "등록 중..."
                : isEdit
                  ? "수정하기"
                  : "등록하기"}
            </button>
          </div>

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

    </div>
  );
}
