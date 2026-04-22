"use client";

import { Briefcase, ChevronLeft, User } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  name: string | null;
  avatar_url: string | null;
  affiliation: string | null;
  job_title: string | null;
  region: string | null;
  keywords: string[] | null;
};

type FieldKey = "avatar" | "affiliation" | "job_title" | "region" | "keywords";
type Step = "edit" | "preview";

export type ApplyPayload = {
  name: string | null;
  avatar_url: string | null;
  affiliation: string | null;
  job_title: string | null;
  region: string | null;
  keywords: string[] | null;
  message: string;
};

export default function ApplyModal({
  open,
  onClose,
  collabTitle,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  collabTitle: string;
  onSubmit: (payload: ApplyPayload) => Promise<void> | void;
}) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [include, setInclude] = useState<Record<FieldKey, boolean>>({
    avatar: false,
    affiliation: false,
    job_title: false,
    region: false,
    keywords: false,
  });
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<Step>("edit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setSubmitting(false);
      setStep("edit");
      setInclude({
        avatar: false,
        affiliation: false,
        job_title: false,
        region: false,
        keywords: false,
      });
      return;
    }
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url, affiliation, job_title, region, keywords")
        .eq("id", user.id)
        .maybeSingle();
      setProfile((data ?? null) as ProfileRow | null);
      setLoading(false);
    })();
  }, [open]);

  const toggle = (k: FieldKey) =>
    setInclude((prev) => ({ ...prev, [k]: !prev[k] }));

  const buildPayload = (): ApplyPayload | null => {
    if (!profile) return null;
    return {
      name: profile.name ?? null,
      avatar_url:
        include.avatar && profile.avatar_url ? profile.avatar_url : null,
      affiliation:
        include.affiliation && profile.affiliation ? profile.affiliation : null,
      job_title:
        include.job_title && profile.job_title ? profile.job_title : null,
      region: include.region && profile.region ? profile.region : null,
      keywords:
        include.keywords && profile.keywords?.length ? profile.keywords : null,
      message: message.trim(),
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload || !payload.message) return;
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const hasKeywords = !!profile?.keywords?.length;
  const hasAvatar = !!profile?.avatar_url;
  const canProceed = !loading && !!profile && !!message.trim();
  const previewPayload = step === "preview" ? buildPayload() : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === "edit" ? "참여 요청 보내기" : "이렇게 보냅니다"}
      size="md"
    >
      <div className="flex flex-col h-full min-h-0">
        {step === "edit" ? (
          <>
            <p className="text-xs text-text-5 mb-4">
              &quot;{collabTitle}&quot; 게시자에게 공개할 정보를 고르고 메시지를 남겨주세요.
            </p>

            <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2 space-y-5">
              <section>
                <h3 className="text-[11px] font-semibold text-text-5 tracking-wider mb-2">
                  공개할 프로필 정보
                </h3>
                {loading ? (
                  <div className="text-xs text-text-6 py-3">프로필 불러오는 중…</div>
                ) : !profile ? (
                  <div className="text-xs text-text-6 py-3">
                    프로필 정보를 찾을 수 없어요.
                  </div>
                ) : (
                  <ul className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                    <FixedRow label="이름" value={profile.name} />
                    <ToggleRow
                      label="아바타"
                      value={hasAvatar ? "프로필 사진" : null}
                      checked={include.avatar && hasAvatar}
                      onChange={() => toggle("avatar")}
                      disabled={!hasAvatar}
                    />
                    <ToggleRow
                      label="소속"
                      value={profile.affiliation}
                      checked={include.affiliation && !!profile.affiliation}
                      onChange={() => toggle("affiliation")}
                      disabled={!profile.affiliation}
                    />
                    <ToggleRow
                      label="직함"
                      value={profile.job_title}
                      checked={include.job_title && !!profile.job_title}
                      onChange={() => toggle("job_title")}
                      disabled={!profile.job_title}
                    />
                    <ToggleRow
                      label="지역"
                      value={profile.region}
                      checked={include.region && !!profile.region}
                      onChange={() => toggle("region")}
                      disabled={!profile.region}
                    />
                    <ToggleRow
                      label="키워드"
                      value={hasKeywords ? profile.keywords!.map((k) => `#${k}`).join(" ") : null}
                      checked={include.keywords && hasKeywords}
                      onChange={() => toggle("keywords")}
                      disabled={!hasKeywords}
                    />
                  </ul>
                )}
              </section>

              <section>
                <h3 className="text-[11px] font-semibold text-text-5 tracking-wider mb-2">
                  메시지
                </h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="상대방에게 보낼 메시지를 작성해주세요."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent resize-none"
                />
              </section>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm text-text-3 hover:bg-black/5 dark:hover:bg-white/5"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => setStep("preview")}
                disabled={!canProceed}
                className="px-4 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-sm font-semibold disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-text-5 mb-4">
              &quot;{collabTitle}&quot; 게시자에게 아래 카드가 전달됩니다. 확인 후 보내주세요.
            </p>

            <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2">
              {previewPayload && <PreviewCard payload={previewPayload} />}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep("edit")}
                disabled={submitting}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm text-text-3 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
                뒤로
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "전송 중…" : "보내기"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function PreviewCard({ payload }: { payload: ApplyPayload }) {
  const metaParts = [payload.affiliation, payload.job_title, payload.region].filter(
    (v): v is string => !!v,
  );
  const label = payload.name?.trim() || payload.affiliation?.trim() || "익명 요청자";

  return (
    <div className="rounded-lg p-2.5 border bg-[#999f54]/8 border-[#999f54]/20">
      <div className="flex items-start gap-2">
        <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
          {payload.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={payload.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={16} strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-text-1 truncate">{label}</div>
          {metaParts.length > 0 && (
            <div className="mt-0.5 flex items-baseline gap-1 text-[11px] text-text-5">
              <Briefcase size={11} className="text-[#999f54] shrink-0 self-center" />
              <span className="truncate">{metaParts.join(" · ")}</span>
            </div>
          )}
          {payload.keywords && payload.keywords.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {payload.keywords.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54]/10 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25"
                >
                  #{k}
                </span>
              ))}
            </div>
          )}
          {payload.message && (
            <p className="mt-1.5 text-[11px] text-text-4 whitespace-pre-wrap">
              {payload.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FixedRow({ label, value }: { label: string; value: string | null }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-14 shrink-0 text-[11px] text-text-6">{label}</span>
      <span className="flex-1 text-sm text-text-1 truncate">
        {value || <span className="text-text-6">(비어 있음)</span>}
      </span>
      <span className="text-[10px] text-text-6">필수</span>
    </li>
  );
}

function ToggleRow({
  label,
  value,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-14 shrink-0 text-[11px] text-text-6">{label}</span>
      <span
        className={`flex-1 text-sm truncate ${disabled ? "text-text-6" : "text-text-1"}`}
      >
        {value || <span className="text-text-6">(비어 있음)</span>}
      </span>
      <label className="inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <span className="w-8 h-[18px] bg-black/10 dark:bg-white/15 rounded-full peer-checked:bg-[#999f54] peer-disabled:opacity-40 transition-colors relative after:content-[''] after:absolute after:w-3.5 after:h-3.5 after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform peer-checked:after:translate-x-[14px]" />
      </label>
    </li>
  );
}
