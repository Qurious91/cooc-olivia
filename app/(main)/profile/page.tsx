"use client";

import {
  AtSign,
  Briefcase,
  Camera,
  ChefHat,
  Check,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  ArrowUpDown,
  GripVertical,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  User,
  Utensils,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AvatarCropper from "./avatar-cropper";
import PhotoUpload from "./photo-upload";
import Modal from "../../modal";
import MonthPicker, { formatYm } from "../../month-picker";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABELS: Record<string, string> = {
  creator: "크리에이터",
  brand: "브랜드",
  admin: "관리자",
};

type Career = {
  id: string;
  startYm: string;
  endYm: string | null;
  title: string;
  body: string;
};
type Menu = {
  id: string;
  imageUrl: string;
  title: string;
  body: string;
  position: number;
  pendingFile?: File;
};
type Award = {
  id: string;
  receivedYm: string;
  title: string;
  body: string;
};
type Contact = { kind: "ig" | "web" | "mail"; value: string };
type Stat = {
  id: string;
  graduatedYm: string;
  title: string;
  body: string;
};
type Photo = { id: string; imageUrl: string; position: number };

type SectionKey =
  | "position"
  | "career"
  | "awards"
  | "stats"
  | "menus"
  | "contacts"
  | "photos";

type SectionType = {
  key: SectionKey;
  label: string;
  position: number;
  icon: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Check,
  GraduationCap,
  Medal,
  Utensils,
  Camera,
};

type ProfileData = {
  name: string;
  affiliation: string;
  jobTitle: string;
  region: string;
  avatar: string;
  keywords: string[];
  career: Career[];
  stats: Stat[];
  menus: Menu[];
  awards: Award[];
  contacts: Contact[];
  visible: SectionKey[];
};

const DEFAULT_DATA: ProfileData = {
  name: "",
  affiliation: "",
  jobTitle: "",
  region: "",
  avatar: "",
  keywords: [],
  career: [],
  stats: [],
  menus: [],
  awards: [],
  contacts: [],
  visible: [],
};

const INPUT_BASE =
  "bg-transparent border-b border-dashed border-[#999f54]/35 rounded-none outline-none pb-px transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54]";

const TEXTAREA_BASE =
  "bg-transparent border border-dashed border-[#999f54]/35 rounded-md px-3 py-2 outline-none transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54] focus:bg-[#999f54]/5";

function ReorderRow({ type }: { type: SectionType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.key });
  const Icon = ICON_MAP[type.icon] ?? Plus;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-surface touch-none select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? "border-[#999f54] shadow-lg"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <Icon size={14} className="text-[#999f54] shrink-0" />
      <span className="flex-1 min-w-0 text-sm font-medium text-text-2 truncate">
        {type.label}
      </span>
      <GripVertical size={14} className="text-text-6 shrink-0" />
    </div>
  );
}

function SectionShell({
  type,
  editing,
  onRemove,
  children,
}: {
  type: SectionType;
  editing: boolean;
  onRemove: (k: SectionKey) => void;
  children?: React.ReactNode;
}) {
  const Icon = ICON_MAP[type.icon] ?? Plus;
  return (
    <section
      className={`mt-2 rounded-xl bg-surface shadow-sm overflow-hidden ${
        editing
          ? "border border-dashed border-[#999f54]/50"
          : "border border-black/10 dark:border-white/10"
      }`}
    >
      <div className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
          <Icon size={16} className="text-[#999f54]" />
          {type.label}
          {editing && (
            <button
              type="button"
              onClick={() => onRemove(type.key)}
              aria-label={`${type.label} 제거`}
              className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
            >
              <X size={12} /> 제거
            </button>
          )}
        </h2>
        {children ?? (
          <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
        )}
      </div>
    </section>
  );
}

function CurrentContent({
  editing,
  showPreview,
  affiliation,
  jobTitle,
  region,
  onPatch,
}: {
  editing: boolean;
  showPreview: boolean;
  affiliation: string;
  jobTitle: string;
  region: string;
  onPatch: (patch: { affiliation?: string; jobTitle?: string; region?: string }) => void;
}) {
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const hasAny = Boolean(affiliation || jobTitle || region);
  const preview = !hasAny ? (
    <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
  ) : (
    <div className="space-y-1">
      {affiliation ? (
        <div className="text-base font-semibold text-text-1 leading-tight">
          {affiliation}
        </div>
      ) : (
        <div className="text-base font-semibold text-text-6 leading-tight">
          소속
        </div>
      )}
      {(jobTitle || region) && (
        <div className="flex items-center gap-2 text-xs text-text-5">
          {jobTitle && <span>{jobTitle}</span>}
          {jobTitle && region && (
            <span className="w-1 h-1 rounded-full bg-text-6" />
          )}
          {region && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.75} />
              {region}
            </span>
          )}
        </div>
      )}
    </div>
  );
  if (!editing) return preview;
  return (
    <div className="space-y-4">
      {hasAny && showPreview && (
        <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10">
          <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          {preview}
        </div>
      )}
      <div className="space-y-3 text-sm">
      <label className="flex gap-3 items-baseline">
        <span className="shrink-0 w-16 text-xs text-text-6">
          소속 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={affiliation}
          onChange={(e) => onPatch({ affiliation: e.target.value })}
          onPointerDown={stop}
          className={`${INPUT_BASE} flex-1 min-w-0 text-text-1`}
        />
      </label>
      <label className="flex gap-3 items-baseline">
        <span className="shrink-0 w-16 text-xs text-text-6">포지션</span>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => onPatch({ jobTitle: e.target.value })}
          onPointerDown={stop}
          className={`${INPUT_BASE} flex-1 min-w-0 text-text-1`}
        />
      </label>
      <label className="flex gap-3 items-baseline">
        <span className="shrink-0 w-16 text-xs text-text-6">지역</span>
        <input
          type="text"
          value={region}
          onChange={(e) => onPatch({ region: e.target.value })}
          onPointerDown={stop}
          className={`${INPUT_BASE} flex-1 min-w-0 text-text-1`}
        />
      </label>
      </div>
    </div>
  );
}

function CareerContent({
  editing,
  showPreview,
  items,
  onPatch,
  onAdd,
  onRemove,
}: {
  editing: boolean;
  showPreview: boolean;
  items: Career[];
  onPatch: (id: string, patch: Partial<Career>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const preview =
    items.length === 0 ? (
      <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
    ) : (
      <ul className="space-y-4 text-sm">
        {items.map((c) => (
          <li key={c.id} className="flex gap-3 items-baseline">
            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
              {c.startYm ? formatYm(c.startYm) : "----.--"}
              <span className="mx-1">~</span>
              {c.endYm ? formatYm(c.endYm) : "현재"}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-text-1 font-medium">
                {c.title || <span className="text-text-6">제목</span>}
              </div>
              {c.body && (
                <p className="text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                  {c.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  if (!editing) return preview;
  return (
    <div className="space-y-4">
      {items.length > 0 && showPreview && (
        <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10">
          <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          {preview}
        </div>
      )}
      {items.map((c) => (
        <div
          key={c.id}
          className="space-y-2 pb-4 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0"
        >
          <div className="flex gap-3 items-center">
            <span className="shrink-0 w-16 text-xs text-text-6">기간</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-24">
                <MonthPicker
                  value={c.startYm}
                  onChange={(v) => onPatch(c.id, { startYm: v })}
                />
              </div>
              <span className="text-text-6 text-xs">~</span>
              <div className="w-24">
                <MonthPicker
                  value={c.endYm ?? ""}
                  onChange={(v) => onPatch(c.id, { endYm: v || null })}
                  emptyLabel="현재"
                  allowClear
                />
              </div>
            </div>
          </div>
          <label className="flex gap-3 items-baseline">
            <span className="shrink-0 w-16 text-xs text-text-6">주요 내용</span>
            <input
              type="text"
              value={c.title}
              onChange={(e) => onPatch(c.id, { title: e.target.value })}
              onPointerDown={stop}
              className={`${INPUT_BASE} text-sm text-text-1 flex-1 min-w-0`}
            />
          </label>
          <label className="flex gap-3 items-start">
            <span className="shrink-0 w-16 text-xs text-text-6 pt-2">상세 내용</span>
            <textarea
              value={c.body}
              onChange={(e) => onPatch(c.id, { body: e.target.value })}
              onPointerDown={stop}
              rows={2}
              className={`${TEXTAREA_BASE} text-xs flex-1 min-w-0`}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onPointerDown={stop}
              onClick={() => onRemove(c.id)}
              aria-label="경력 제거"
              className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-500/5"
            >
              <Trash2 size={12} />
              삭제
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onPointerDown={stop}
        onClick={onAdd}
        className="w-full py-2 text-xs text-text-5 border border-dashed border-[#999f54]/40 rounded-lg hover:border-[#999f54] hover:text-[#999f54]"
      >
        <Plus size={12} className="inline mr-1" /> 경력 추가
      </button>
    </div>
  );
}

function AwardContent({
  editing,
  showPreview,
  items,
  onPatch,
  onAdd,
  onRemove,
}: {
  editing: boolean;
  showPreview: boolean;
  items: Award[];
  onPatch: (id: string, patch: Partial<Award>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const preview =
    items.length === 0 ? (
      <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
    ) : (
      <ul className="space-y-4 text-sm">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3 items-baseline">
            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
              {a.receivedYm ? formatYm(a.receivedYm) : "----.--"}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-text-1 font-medium">
                {a.title || <span className="text-text-6">제목</span>}
              </div>
              {a.body && (
                <p className="text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                  {a.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  if (!editing) return preview;
  return (
    <div className="space-y-4">
      {items.length > 0 && showPreview && (
        <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10">
          <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          {preview}
        </div>
      )}
      {items.map((a) => (
        <div
          key={a.id}
          className="space-y-2 pb-4 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0"
        >
          <div className="flex gap-3 items-center">
            <span className="shrink-0 w-16 text-xs text-text-6">연월</span>
            <div className="w-24">
              <MonthPicker
                value={a.receivedYm}
                onChange={(v) => onPatch(a.id, { receivedYm: v })}
              />
            </div>
          </div>
          <label className="flex gap-3 items-baseline">
            <span className="shrink-0 w-16 text-xs text-text-6">주요 내용</span>
            <input
              type="text"
              value={a.title}
              onChange={(e) => onPatch(a.id, { title: e.target.value })}
              onPointerDown={stop}
              className={`${INPUT_BASE} text-sm text-text-1 flex-1 min-w-0`}
            />
          </label>
          <label className="flex gap-3 items-start">
            <span className="shrink-0 w-16 text-xs text-text-6 pt-2">상세 내용</span>
            <textarea
              value={a.body}
              onChange={(e) => onPatch(a.id, { body: e.target.value })}
              onPointerDown={stop}
              rows={2}
              className={`${TEXTAREA_BASE} text-xs flex-1 min-w-0`}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onPointerDown={stop}
              onClick={() => onRemove(a.id)}
              aria-label="수상 제거"
              className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-500/5"
            >
              <Trash2 size={12} />
              삭제
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onPointerDown={stop}
        onClick={onAdd}
        className="w-full py-2 text-xs text-text-5 border border-dashed border-[#999f54]/40 rounded-lg hover:border-[#999f54] hover:text-[#999f54]"
      >
        <Plus size={12} className="inline mr-1" /> 수상 추가
      </button>
    </div>
  );
}

function EducationContent({
  editing,
  showPreview,
  items,
  onPatch,
  onAdd,
  onRemove,
}: {
  editing: boolean;
  showPreview: boolean;
  items: Stat[];
  onPatch: (id: string, patch: Partial<Stat>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const preview =
    items.length === 0 ? (
      <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
    ) : (
      <ul className="space-y-4 text-sm">
        {items.map((s) => (
          <li key={s.id} className="flex gap-3 items-baseline">
            <div className="shrink-0 w-28 text-xs text-text-6 tabular-nums">
              {s.graduatedYm ? formatYm(s.graduatedYm) : "----.--"}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-text-1 font-medium">
                {s.title || <span className="text-text-6">제목</span>}
              </div>
              {s.body && (
                <p className="text-xs text-text-5 leading-relaxed whitespace-pre-wrap">
                  {s.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  if (!editing) return preview;
  return (
    <div className="space-y-4">
      {items.length > 0 && showPreview && (
        <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10">
          <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          {preview}
        </div>
      )}
      {items.map((s) => (
        <div
          key={s.id}
          className="space-y-2 pb-4 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0"
        >
          <div className="flex gap-3 items-center">
            <span className="shrink-0 w-16 text-xs text-text-6">연월</span>
            <div className="w-24">
              <MonthPicker
                value={s.graduatedYm}
                onChange={(v) => onPatch(s.id, { graduatedYm: v })}
              />
            </div>
          </div>
          <label className="flex gap-3 items-baseline">
            <span className="shrink-0 w-16 text-xs text-text-6">주요 내용</span>
            <input
              type="text"
              value={s.title}
              onChange={(e) => onPatch(s.id, { title: e.target.value })}
              onPointerDown={stop}
              className={`${INPUT_BASE} text-sm text-text-1 flex-1 min-w-0`}
            />
          </label>
          <label className="flex gap-3 items-start">
            <span className="shrink-0 w-16 text-xs text-text-6 pt-2">상세 내용</span>
            <textarea
              value={s.body}
              onChange={(e) => onPatch(s.id, { body: e.target.value })}
              onPointerDown={stop}
              rows={2}
              className={`${TEXTAREA_BASE} text-xs flex-1 min-w-0`}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onPointerDown={stop}
              onClick={() => onRemove(s.id)}
              aria-label="학력 제거"
              className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-500/5"
            >
              <Trash2 size={12} />
              삭제
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onPointerDown={stop}
        onClick={onAdd}
        className="w-full py-2 text-xs text-text-5 border border-dashed border-[#999f54]/40 rounded-lg hover:border-[#999f54] hover:text-[#999f54]"
      >
        <Plus size={12} className="inline mr-1" /> 학력 추가
      </button>
    </div>
  );
}

function PhotosContent({
  editing,
  photos,
  uploading,
  onAdd,
  onRemove,
}: {
  editing: boolean;
  photos: Photo[];
  uploading: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  if (!editing) {
    if (photos.length === 0) {
      return <p className="text-xs text-text-6">내용을 추가해 보세요.</p>;
    }
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <div
            key={p.id}
            className="isolate aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative isolate aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onPointerDown={stop}
                onClick={() => onRemove(p.id)}
                aria-label="사진 제거"
                className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/55 text-white hover:bg-red-500/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          if (files.length > 0) onAdd(files);
        }}
      />
      <button
        type="button"
        onPointerDown={stop}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2 text-xs text-text-5 border border-dashed border-[#999f54]/40 rounded-lg hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-50"
      >
        <Plus size={12} className="inline mr-1" />
        {uploading ? "업로드 중..." : "사진 추가"}
      </button>
    </div>
  );
}

function MenuContent({
  editing,
  showPreview,
  items,
  onPatch,
  onAdd,
  onRemove,
}: {
  editing: boolean;
  showPreview: boolean;
  items: Menu[];
  onPatch: (id: string, patch: Partial<Menu>) => void;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const preview =
    items.length === 0 ? (
      <p className="text-xs text-text-6">내용을 추가해 보세요.</p>
    ) : (
      <ul className="grid grid-cols-2 gap-3">
        {items.map((m) => (
          <li key={m.id} className="space-y-1.5">
            <div className="isolate aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-text-1 font-medium truncate">
                {m.title || <span className="text-text-6">제목</span>}
              </div>
              {m.body && (
                <p className="text-xs text-text-5 leading-relaxed line-clamp-2 mt-0.5">
                  {m.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  if (!editing) return preview;
  return (
    <div className="space-y-4">
      {items.length > 0 && showPreview && (
        <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10">
          <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          {preview}
        </div>
      )}
      {items.map((m) => (
        <div
          key={m.id}
          className="flex gap-3 pb-4 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0"
        >
          <div className="shrink-0 isolate w-20 h-20 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <label className="flex gap-3 items-baseline">
              <span className="shrink-0 w-16 text-xs text-text-6">
                주요 내용 <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={m.title}
                onChange={(e) => onPatch(m.id, { title: e.target.value })}
                onPointerDown={stop}
                className={`${INPUT_BASE} text-sm text-text-1 flex-1 min-w-0`}
              />
            </label>
            <label className="flex gap-3 items-start">
              <span className="shrink-0 w-16 text-xs text-text-6 pt-2">상세 내용</span>
              <textarea
                value={m.body}
                onChange={(e) => onPatch(m.id, { body: e.target.value })}
                onPointerDown={stop}
                rows={2}
                className={`${TEXTAREA_BASE} text-xs flex-1 min-w-0`}
              />
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onPointerDown={stop}
                onClick={() => onRemove(m.id)}
                aria-label="메뉴 제거"
                className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-500/5"
              >
                <Trash2 size={12} />
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          if (files.length > 0) onAdd(files);
        }}
      />
      <button
        type="button"
        onPointerDown={stop}
        onClick={() => inputRef.current?.click()}
        className="w-full py-2 text-xs text-text-5 border border-dashed border-[#999f54]/40 rounded-lg hover:border-[#999f54] hover:text-[#999f54]"
      >
        <Plus size={12} className="inline mr-1" /> 메뉴 추가
      </button>
    </div>
  );
}

function TextField({
  value,
  editing,
  onChange,
  className = "",
  placeholder,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (!editing) return <span className={className}>{value}</span>;
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_BASE} ${className} w-full`}
    />
  );
}

function TextArea({
  value,
  editing,
  onChange,
  className = "",
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
}) {
  if (!editing) return <p className={className}>{value}</p>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={`${TEXTAREA_BASE} ${className} w-full`}
    />
  );
}

export default function Profile() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA);
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<{
    name: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
  const [removeTarget, setRemoveTarget] = useState<SectionKey | null>(null);
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [committing, setCommitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: row } = await supabase
        .from("profiles")
        .select("name, role, avatar_url, affiliation, job_title, region")
        .eq("id", user.id)
        .single();
      if (row) {
        setProfile({ name: row.name, role: row.role, avatar_url: row.avatar_url });
        if (row.name) setNameInput(row.name);
        if (row.role) setRoleInput(row.role);
        setData((d) => ({
          ...d,
          affiliation: row.affiliation ?? "",
          jobTitle: row.job_title ?? "",
          region: row.region ?? "",
        }));
      }
      const { data: sections } = await supabase
        .from("profile_sections")
        .select("kind, position, visible")
        .eq("profile_id", user.id)
        .eq("visible", true)
        .order("position");
      if (sections) {
        const kinds = sections.map((s) => s.kind as SectionKey);
        setData((d) => ({ ...d, visible: kinds }));
      }
      const { data: careers } = await supabase
        .from("profile_careers")
        .select("id, start_ym, end_ym, title, body")
        .eq("profile_id", user.id)
        .order("start_ym", { ascending: false });
      if (careers) {
        setData((d) => ({
          ...d,
          career: careers.map((c) => ({
            id: c.id as string,
            startYm: c.start_ym as string,
            endYm: (c.end_ym as string | null) ?? null,
            title: c.title as string,
            body: (c.body as string | null) ?? "",
          })),
        }));
      }
      const { data: awards } = await supabase
        .from("profile_awards")
        .select("id, received_ym, title, body")
        .eq("profile_id", user.id)
        .order("received_ym", { ascending: false });
      if (awards) {
        setData((d) => ({
          ...d,
          awards: awards.map((a) => ({
            id: a.id as string,
            receivedYm: a.received_ym as string,
            title: a.title as string,
            body: (a.body as string | null) ?? "",
          })),
        }));
      }
      const { data: educations } = await supabase
        .from("profile_educations")
        .select("id, graduated_ym, title, body")
        .eq("profile_id", user.id)
        .order("graduated_ym", { ascending: false });
      if (educations) {
        setData((d) => ({
          ...d,
          stats: educations.map((e) => ({
            id: e.id as string,
            graduatedYm: e.graduated_ym as string,
            title: e.title as string,
            body: (e.body as string | null) ?? "",
          })),
        }));
      }
      const { data: menuRows } = await supabase
        .from("profile_menus")
        .select("id, image_url, title, body, position")
        .eq("profile_id", user.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (menuRows) {
        setData((d) => ({
          ...d,
          menus: menuRows.map((m) => ({
            id: m.id as string,
            imageUrl: m.image_url as string,
            title: m.title as string,
            body: (m.body as string | null) ?? "",
            position: m.position as number,
          })),
        }));
      }
      const { data: photoRows } = await supabase
        .from("profile_photos")
        .select("id, image_url, position")
        .eq("profile_id", user.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (photoRows) {
        setPhotos(
          photoRows.map((p) => ({
            id: p.id as string,
            imageUrl: p.image_url as string,
            position: p.position as number,
          })),
        );
      }
    })();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: rows } = await supabase
        .from("profile_section_types")
        .select("key, label, position, icon")
        .order("position");
      if (rows) setSectionTypes(rows as SectionType[]);
    })();
  }, []);

  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingAvatarFile(file);
  };

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [avatarMenuOpen]);

  const handleAvatarRemove = async () => {
    if (!userId) return;
    setAvatarMenuOpen(false);
    const supabase = createClient();
    await supabase.storage
      .from("profile")
      .remove([`avatars/${userId}/avatar.jpg`]);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);
    if (!error) {
      setProfile((p) => (p ? { ...p, avatar_url: null } : p));
    }
  };

  const handleAvatarConfirm = async (blob: Blob) => {
    setPendingAvatarFile(null);
    if (!userId) return;
    const supabase = createClient();
    const path = `avatars/${userId}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("profile")
      .upload(path, blob, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "3600",
      });
    if (uploadError) return;
    const { data: publicData } = supabase.storage
      .from("profile")
      .getPublicUrl(path);
    const url = `${publicData.publicUrl}?v=${Date.now()}`;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", userId);
    if (!error) {
      setProfile((p) => (p ? { ...p, avatar_url: url } : p));
    }
  };

  const isOnboarded =
    profile !== null && !!profile.name && !!profile.role;
  const needsOnboarding = profile !== null && !isOnboarded;

  const handleOnboardingSave = async () => {
    if (!userId || !nameInput.trim() || !roleInput.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name: nameInput.trim(), role: roleInput.trim() })
      .eq("id", userId);
    setSaving(false);
    if (!error) {
      setProfile((p) => ({
        name: nameInput.trim(),
        role: roleInput.trim(),
        avatar_url: p?.avatar_url ?? null,
      }));
    }
  };

  const isVisible = (k: SectionKey) => data.visible.includes(k);
  const availableSections = sectionTypes.filter((s) => !isVisible(s.key));
  const orderedSectionTypes = data.visible
    .map((k) => sectionTypes.find((t) => t.key === k))
    .filter((t): t is SectionType => !!t);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setData((d) => {
      const from = d.visible.indexOf(active.id as SectionKey);
      const to = d.visible.indexOf(over.id as SectionKey);
      if (from === -1 || to === -1) return d;
      return { ...d, visible: arrayMove(d.visible, from, to) };
    });
  };

  const startEdit = () => {
    setOriginalData(structuredClone(data));
    setNameInput(profile?.name ?? "");
    setRoleInput(profile?.role ?? "");
    setShowPreview(true);
    setEditing(true);
  };

  const cancelEdit = () => {
    for (const m of data.menus) {
      if (m.pendingFile && m.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(m.imageUrl);
      }
    }
    if (originalData) setData(originalData);
    setOriginalData(null);
    setNameInput(profile?.name ?? "");
    setRoleInput(profile?.role ?? "");
    setEditing(false);
    setPickerOpen(false);
    setReorderOpen(false);
    setRemoveTarget(null);
    setAvatarMenuOpen(false);
  };

  const currentVisible = data.visible.includes("position");
  const currentOk = !currentVisible || data.affiliation.trim().length > 0;
  const careerOk = data.career.every(
    (c) => c.startYm.length > 0 && c.title.trim().length > 0,
  );
  const awardsOk = data.awards.every(
    (a) => a.receivedYm.length > 0 && a.title.trim().length > 0,
  );
  const statsOk = data.stats.every(
    (s) => s.graduatedYm.length > 0 && s.title.trim().length > 0,
  );
  const menusOk = data.menus.every((m) => m.title.trim().length > 0);
  const headerOk = nameInput.trim().length > 0 && roleInput.trim().length > 0;
  const canCommit =
    headerOk && currentOk && careerOk && awardsOk && statsOk && menusOk;

  const addCareer = () => {
    setData((d) => ({
      ...d,
      career: [
        ...d.career,
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          startYm: "",
          endYm: null,
          title: "",
          body: "",
        },
      ],
    }));
  };

  const patchCareer = (id: string, patch: Partial<Career>) => {
    setData((d) => ({
      ...d,
      career: d.career.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const removeCareer = (id: string) => {
    setData((d) => ({ ...d, career: d.career.filter((c) => c.id !== id) }));
  };

  const addAward = () => {
    setData((d) => ({
      ...d,
      awards: [
        ...d.awards,
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          receivedYm: "",
          title: "",
          body: "",
        },
      ],
    }));
  };

  const patchAward = (id: string, patch: Partial<Award>) => {
    setData((d) => ({
      ...d,
      awards: d.awards.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  };

  const removeAward = (id: string) => {
    setData((d) => ({ ...d, awards: d.awards.filter((a) => a.id !== id) }));
  };

  const addEdu = () => {
    setData((d) => ({
      ...d,
      stats: [
        ...d.stats,
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          graduatedYm: "",
          title: "",
          body: "",
        },
      ],
    }));
  };

  const patchEdu = (id: string, patch: Partial<Stat>) => {
    setData((d) => ({
      ...d,
      stats: d.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const removeEdu = (id: string) => {
    setData((d) => ({ ...d, stats: d.stats.filter((s) => s.id !== id) }));
  };

  const addMenus = (files: File[]) => {
    if (files.length === 0) return;
    const staged = files.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      tempId: `new-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    setData((d) => {
      const basePos = d.menus.reduce((m, x) => Math.max(m, x.position), -1);
      const newRows: Menu[] = staged.map((s, i) => ({
        id: s.tempId,
        imageUrl: s.url,
        title: "",
        body: "",
        position: basePos + 1 + i,
        pendingFile: s.file,
      }));
      return { ...d, menus: [...d.menus, ...newRows] };
    });
  };

  const patchMenu = (id: string, patch: Partial<Menu>) => {
    setData((d) => ({
      ...d,
      menus: d.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const removeMenu = (id: string) => {
    setData((d) => {
      const target = d.menus.find((m) => m.id === id);
      if (target?.pendingFile && target.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.imageUrl);
      }
      return { ...d, menus: d.menus.filter((m) => m.id !== id) };
    });
  };

  const addPhotos = async (files: File[]) => {
    if (!userId || files.length === 0) return;
    setPhotosUploading(true);
    const supabase = createClient();
    const basePos = photos.reduce((m, p) => Math.max(m, p.position), -1);
    const inserted: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `photos/${userId}/${name}`;
      const { error: upErr } = await supabase.storage
        .from("profile")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        });
      if (upErr) continue;
      const { data: pub } = supabase.storage
        .from("profile")
        .getPublicUrl(path);
      const pos = basePos + 1 + i;
      const { data: row } = await supabase
        .from("profile_photos")
        .insert({
          profile_id: userId,
          image_url: pub.publicUrl,
          position: pos,
        })
        .select("id, image_url, position")
        .single();
      if (row) {
        inserted.push({
          id: row.id as string,
          imageUrl: row.image_url as string,
          position: row.position as number,
        });
      }
    }
    if (inserted.length) {
      setPhotos((prev) => [...prev, ...inserted]);
    }
    setPhotosUploading(false);
  };

  const removePhoto = async (id: string) => {
    if (!userId) return;
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const supabase = createClient();
    try {
      const url = new URL(photo.imageUrl);
      const marker = "/storage/v1/object/public/profile/";
      const idx = url.pathname.indexOf(marker);
      if (idx >= 0) {
        const objectPath = url.pathname.slice(idx + marker.length);
        await supabase.storage.from("profile").remove([objectPath]);
      }
    } catch {
      // invalid URL: skip storage cleanup, proceed with row delete
    }
    await supabase.from("profile_photos").delete().eq("id", id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const commitEdit = async () => {
    if (!userId || !originalData) {
      setEditing(false);
      setOriginalData(null);
      return;
    }
    if (!canCommit) return;
    setCommitting(true);
    const supabase = createClient();
    const before = new Set(originalData.visible);
    const after = new Set(data.visible);
    const removed = [...before].filter((k) => !after.has(k));

    const upserts = data.visible.map((kind, position) => ({
      profile_id: userId,
      kind,
      position,
      visible: true,
    }));
    if (upserts.length) {
      await supabase
        .from("profile_sections")
        .upsert(upserts, { onConflict: "profile_id,kind" });
    }
    if (removed.length) {
      await supabase
        .from("profile_sections")
        .delete()
        .eq("profile_id", userId)
        .in("kind", removed);
    }

    const trimmedName = nameInput.trim();
    const trimmedRole = roleInput.trim();
    await supabase
      .from("profiles")
      .update({
        name: trimmedName,
        role: trimmedRole,
        affiliation: data.affiliation.trim() || null,
        job_title: data.jobTitle.trim() || null,
        region: data.region.trim() || null,
      })
      .eq("id", userId);
    setProfile((p) =>
      p ? { ...p, name: trimmedName, role: trimmedRole } : p,
    );

    const origCareerById = new Map(originalData.career.map((c) => [c.id, c]));
    const curCareerIds = new Set(data.career.map((c) => c.id));
    const careerToInsert = data.career
      .filter((c) => c.id.startsWith("new-"))
      .map((c) => ({
        profile_id: userId,
        start_ym: c.startYm,
        end_ym: c.endYm ?? null,
        title: c.title.trim(),
        body: c.body.trim() || null,
      }));
    const careerToUpdate = data.career.filter((c) => {
      if (c.id.startsWith("new-")) return false;
      const o = origCareerById.get(c.id);
      if (!o) return false;
      return (
        o.startYm !== c.startYm ||
        o.endYm !== c.endYm ||
        o.title !== c.title ||
        o.body !== c.body
      );
    });
    const careerToDelete = originalData.career
      .filter((c) => !c.id.startsWith("new-") && !curCareerIds.has(c.id))
      .map((c) => c.id);

    if (careerToInsert.length) {
      await supabase.from("profile_careers").insert(careerToInsert);
    }
    for (const c of careerToUpdate) {
      await supabase
        .from("profile_careers")
        .update({
          start_ym: c.startYm,
          end_ym: c.endYm ?? null,
          title: c.title.trim(),
          body: c.body.trim() || null,
        })
        .eq("id", c.id);
    }
    if (careerToDelete.length) {
      await supabase
        .from("profile_careers")
        .delete()
        .in("id", careerToDelete);
    }

    if (careerToInsert.length) {
      const { data: reload } = await supabase
        .from("profile_careers")
        .select("id, start_ym, end_ym, title, body")
        .eq("profile_id", userId)
        .order("start_ym", { ascending: false });
      if (reload) {
        setData((d) => ({
          ...d,
          career: reload.map((c) => ({
            id: c.id as string,
            startYm: c.start_ym as string,
            endYm: (c.end_ym as string | null) ?? null,
            title: c.title as string,
            body: (c.body as string | null) ?? "",
          })),
        }));
      }
    }

    const origAwardById = new Map(originalData.awards.map((a) => [a.id, a]));
    const curAwardIds = new Set(data.awards.map((a) => a.id));
    const awardsToInsert = data.awards
      .filter((a) => a.id.startsWith("new-"))
      .map((a) => ({
        profile_id: userId,
        received_ym: a.receivedYm,
        title: a.title.trim(),
        body: a.body.trim() || null,
      }));
    const awardsToUpdate = data.awards.filter((a) => {
      if (a.id.startsWith("new-")) return false;
      const o = origAwardById.get(a.id);
      if (!o) return false;
      return (
        o.receivedYm !== a.receivedYm ||
        o.title !== a.title ||
        o.body !== a.body
      );
    });
    const awardsToDelete = originalData.awards
      .filter((a) => !a.id.startsWith("new-") && !curAwardIds.has(a.id))
      .map((a) => a.id);

    if (awardsToInsert.length) {
      await supabase.from("profile_awards").insert(awardsToInsert);
    }
    for (const a of awardsToUpdate) {
      await supabase
        .from("profile_awards")
        .update({
          received_ym: a.receivedYm,
          title: a.title.trim(),
          body: a.body.trim() || null,
        })
        .eq("id", a.id);
    }
    if (awardsToDelete.length) {
      await supabase
        .from("profile_awards")
        .delete()
        .in("id", awardsToDelete);
    }

    if (awardsToInsert.length) {
      const { data: reload } = await supabase
        .from("profile_awards")
        .select("id, received_ym, title, body")
        .eq("profile_id", userId)
        .order("received_ym", { ascending: false });
      if (reload) {
        setData((d) => ({
          ...d,
          awards: reload.map((a) => ({
            id: a.id as string,
            receivedYm: a.received_ym as string,
            title: a.title as string,
            body: (a.body as string | null) ?? "",
          })),
        }));
      }
    }

    const origEduById = new Map(originalData.stats.map((s) => [s.id, s]));
    const curEduIds = new Set(data.stats.map((s) => s.id));
    const eduToInsert = data.stats
      .filter((s) => s.id.startsWith("new-"))
      .map((s) => ({
        profile_id: userId,
        graduated_ym: s.graduatedYm,
        title: s.title.trim(),
        body: s.body.trim() || null,
      }));
    const eduToUpdate = data.stats.filter((s) => {
      if (s.id.startsWith("new-")) return false;
      const o = origEduById.get(s.id);
      if (!o) return false;
      return (
        o.graduatedYm !== s.graduatedYm ||
        o.title !== s.title ||
        o.body !== s.body
      );
    });
    const eduToDelete = originalData.stats
      .filter((s) => !s.id.startsWith("new-") && !curEduIds.has(s.id))
      .map((s) => s.id);

    if (eduToInsert.length) {
      await supabase.from("profile_educations").insert(eduToInsert);
    }
    for (const s of eduToUpdate) {
      await supabase
        .from("profile_educations")
        .update({
          graduated_ym: s.graduatedYm,
          title: s.title.trim(),
          body: s.body.trim() || null,
        })
        .eq("id", s.id);
    }
    if (eduToDelete.length) {
      await supabase
        .from("profile_educations")
        .delete()
        .in("id", eduToDelete);
    }

    if (eduToInsert.length) {
      const { data: reload } = await supabase
        .from("profile_educations")
        .select("id, graduated_ym, title, body")
        .eq("profile_id", userId)
        .order("graduated_ym", { ascending: false });
      if (reload) {
        setData((d) => ({
          ...d,
          stats: reload.map((s) => ({
            id: s.id as string,
            graduatedYm: s.graduated_ym as string,
            title: s.title as string,
            body: (s.body as string | null) ?? "",
          })),
        }));
      }
    }

    const origMenuById = new Map(originalData.menus.map((m) => [m.id, m]));
    const curMenuIds = new Set(data.menus.map((m) => m.id));
    const menusNewItems = data.menus.filter((m) => m.id.startsWith("new-"));
    const menusToInsert: {
      profile_id: string;
      image_url: string;
      title: string;
      body: string | null;
      position: number;
    }[] = [];
    for (const m of menusNewItems) {
      if (!m.pendingFile) continue;
      const ext = (m.pendingFile.name.split(".").pop() || "jpg").toLowerCase();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `signatures/${userId}/${name}`;
      const { error: upErr } = await supabase.storage
        .from("profile")
        .upload(path, m.pendingFile, {
          contentType: m.pendingFile.type || "image/jpeg",
          cacheControl: "3600",
        });
      if (upErr) continue;
      const { data: pub } = supabase.storage
        .from("profile")
        .getPublicUrl(path);
      menusToInsert.push({
        profile_id: userId,
        image_url: pub.publicUrl,
        title: m.title.trim(),
        body: m.body.trim() || null,
        position: m.position,
      });
    }
    const menusToUpdate = data.menus.filter((m) => {
      if (m.id.startsWith("new-")) return false;
      const o = origMenuById.get(m.id);
      if (!o) return false;
      return (
        o.title !== m.title ||
        o.body !== m.body ||
        o.position !== m.position
      );
    });
    const menusDeletedItems = originalData.menus.filter(
      (m) => !m.id.startsWith("new-") && !curMenuIds.has(m.id),
    );

    if (menusToInsert.length) {
      await supabase.from("profile_menus").insert(menusToInsert);
    }
    for (const m of menusToUpdate) {
      await supabase
        .from("profile_menus")
        .update({
          title: m.title.trim(),
          body: m.body.trim() || null,
          position: m.position,
        })
        .eq("id", m.id);
    }
    if (menusDeletedItems.length) {
      const pathsToRemove: string[] = [];
      for (const m of menusDeletedItems) {
        try {
          const url = new URL(m.imageUrl);
          const marker = "/storage/v1/object/public/profile/";
          const idx = url.pathname.indexOf(marker);
          if (idx >= 0) {
            pathsToRemove.push(url.pathname.slice(idx + marker.length));
          }
        } catch {
          // skip malformed URLs
        }
      }
      if (pathsToRemove.length) {
        await supabase.storage.from("profile").remove(pathsToRemove);
      }
      await supabase
        .from("profile_menus")
        .delete()
        .in(
          "id",
          menusDeletedItems.map((m) => m.id),
        );
    }

    if (menusNewItems.length || menusDeletedItems.length) {
      const { data: reload } = await supabase
        .from("profile_menus")
        .select("id, image_url, title, body, position")
        .eq("profile_id", userId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (reload) {
        for (const m of data.menus) {
          if (m.pendingFile && m.imageUrl.startsWith("blob:")) {
            URL.revokeObjectURL(m.imageUrl);
          }
        }
        setData((d) => ({
          ...d,
          menus: reload.map((m) => ({
            id: m.id as string,
            imageUrl: m.image_url as string,
            title: m.title as string,
            body: (m.body as string | null) ?? "",
            position: m.position as number,
          })),
        }));
      }
    }

    setCommitting(false);
    setOriginalData(null);
    setEditing(false);
  };

  const addSection = (k: SectionKey) => {
    setData((d) => {
      if (d.visible.includes(k)) return d;
      const next: ProfileData = { ...d, visible: [...d.visible, k] };
      if (k === "career" && next.career.length === 0) {
        next.career = [
          { id: `new-${Date.now()}`, startYm: "", endYm: null, title: "", body: "" },
        ];
      } else if (k === "awards" && next.awards.length === 0) {
        next.awards = [
          { id: `new-${Date.now()}`, receivedYm: "", title: "", body: "" },
        ];
      } else if (k === "stats" && next.stats.length === 0) {
        next.stats = [
          { id: `new-${Date.now()}`, graduatedYm: "", title: "", body: "" },
        ];
      } else if (k === "contacts" && next.contacts.length === 0) {
        next.contacts = [{ kind: "ig", value: "" }];
      }
      return next;
    });
    if (availableSections.length <= 1) setPickerOpen(false);
  };

  const removeSection = (k: SectionKey) => {
    setRemoveTarget(k);
  };

  const confirmRemoveSection = () => {
    const k = removeTarget;
    if (!k) return;
    setRemoveTarget(null);
    setData((d) => {
      const next: ProfileData = {
        ...d,
        visible: d.visible.filter((x) => x !== k),
      };
      if (k === "career") next.career = [];
      else if (k === "awards") next.awards = [];
      else if (k === "stats") next.stats = [];
      else if (k === "menus") next.menus = [];
      else if (k === "contacts") next.contacts = [];
      return next;
    });
  };

  const patchItem = <K extends "career" | "menus" | "awards" | "stats" | "contacts">(
    key: K,
    i: number,
    patch: Partial<ProfileData[K][number]>,
  ) =>
    setData((d) => ({
      ...d,
      [key]: (d[key] as ProfileData[K]).map((it, idx) =>
        idx === i ? { ...it, ...patch } : it,
      ) as ProfileData[K],
    }));

  return (
    <>
      <main className="flex-1 px-4 pt-6 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        {isOnboarded && (
          <div className="flex justify-end gap-2 mb-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={committing}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-black/15 dark:border-white/15 text-text-4 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  <XCircle size={14} />
                  취소
                </button>
                <button
                  type="button"
                  onClick={commitEdit}
                  disabled={committing || !canCommit}
                  title={
                    !canCommit
                      ? !headerOk
                        ? "이름과 역할을 입력해주세요"
                        : "필수 항목을 입력해주세요"
                      : undefined
                  }
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#999f54] bg-[#999f54] text-[#F2F0DC] disabled:opacity-60"
                >
                  <Check size={14} />
                  {committing ? "저장 중..." : "저장"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-black/15 dark:border-white/15 text-text-1 hover:bg-[#999f54]/10"
              >
                <Pencil size={14} />
                수정
              </button>
            )}
          </div>
        )}

        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-5">
          {editing && !needsOnboarding && (
            <div className="text-[10px] text-text-6 mb-2 tracking-wide">미리보기</div>
          )}
          <div className="flex items-start gap-5">
            {isOnboarded && (
              <div className="shrink-0 relative" ref={avatarMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!editing) return;
                    if (profile?.avatar_url) {
                      setAvatarMenuOpen((v) => !v);
                    } else {
                      avatarInputRef.current?.click();
                    }
                  }}
                  disabled={!editing}
                  aria-label="프로필 사진 편집"
                  className="relative w-14 h-14 rounded-full overflow-hidden bg-[#999f54] text-[#F2F0DC] flex items-center justify-center"
                >
                  {profile?.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} strokeWidth={1.75} />
                  )}
                  {editing && (
                    <span className="absolute inset-0 bg-black/45 text-white flex items-center justify-center">
                      <Plus size={20} strokeWidth={2} />
                    </span>
                  )}
                </button>
                {editing && avatarMenuOpen && profile?.avatar_url && (
                  <div className="absolute top-full left-0 mt-2 z-20 min-w-[120px] rounded-xl bg-surface border border-black/10 dark:border-white/10 shadow-lg py-1 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        avatarInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-text-1 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Pencil size={13} />
                      변경
                    </button>
                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-red-500/5"
                    >
                      <Trash2 size={13} />
                      제거
                    </button>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarPick}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {needsOnboarding ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-4 mb-1.5">
                      이름
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full px-3 py-2.5 rounded-lg border border-border text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-4 mb-1.5">
                      역할
                    </label>
                    <input
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      placeholder="예) 크리에이터 / 브랜드"
                      className="w-full px-3 py-2.5 rounded-lg border border-border text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent"
                    />
                  </div>
                  {(nameInput.trim() || roleInput.trim()) && (
                    <div>
                      <p className="text-xs text-text-5 mb-1.5">이렇게 표시되요</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-text-1">
                          {nameInput.trim()}
                        </span>
                        <span className="text-xs text-text-5">
                          {roleInput.trim()}
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleOnboardingSave}
                    disabled={!nameInput.trim() || !roleInput.trim() || saving}
                    className="w-full py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "저장 중..." : "시작하기"}
                  </button>
                </div>
              ) : editing ? (
                <div className="flex items-center h-14 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h1 className="text-lg font-bold text-text-1 truncate leading-tight">
                      {nameInput.trim() || (
                        <span className="text-text-6 font-normal">이름</span>
                      )}
                    </h1>
                    <span className="text-xs text-text-5 truncate">
                      {roleInput.trim() || (
                        <span className="text-text-6">역할</span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center h-14 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h1 className="text-lg font-bold text-text-1 truncate leading-tight">
                      {profile?.name ?? ""}
                    </h1>
                    {profile?.role && (
                      <span className="text-xs text-text-5 truncate">
                        {ROLE_LABELS[profile.role] ?? profile.role}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {editing && !needsOnboarding && (
            <div className="mt-4 pt-4 border-t border-dashed border-black/10 dark:border-white/10 space-y-3 text-sm">
              <label className="flex gap-3 items-baseline">
                <span className="shrink-0 w-16 text-xs text-text-6">
                  이름 <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className={`${INPUT_BASE} flex-1 min-w-0 text-text-1`}
                />
              </label>
              <label className="flex gap-3 items-baseline">
                <span className="shrink-0 w-16 text-xs text-text-6">
                  역할 <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="COOC에서의 역할 예) 크리에이터, 브랜드"
                  className={`${INPUT_BASE} flex-1 min-w-0 text-text-1 placeholder:text-text-6`}
                />
              </label>
            </div>
          )}
        </section>

        {isOnboarded && (
        <>
        {editing && (
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={availableSections.length === 0}
              className="inline-flex items-center gap-1 text-xs text-text-5 px-3 py-1.5 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> 항목 추가
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-text-5 px-3 py-1.5 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-[#999f54] hover:text-[#999f54]"
            >
              {showPreview ? (
                <>
                  <EyeOff size={12} /> 미리보기 끄기
                </>
              ) : (
                <>
                  <Eye size={12} /> 미리보기 켜기
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setReorderOpen(true)}
              disabled={orderedSectionTypes.length < 2}
              className="inline-flex items-center gap-1 text-xs text-text-5 px-3 py-1.5 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-[#999f54] hover:text-[#999f54] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUpDown size={12} /> 순서 바꾸기
            </button>
          </div>
        )}

        {orderedSectionTypes.map((type) => (
          <SectionShell
            key={type.key}
            type={type}
            editing={editing}
            onRemove={removeSection}
          >
            {type.key === "position" ? (
              <CurrentContent
                editing={editing}
                showPreview={showPreview}
                affiliation={data.affiliation}
                jobTitle={data.jobTitle}
                region={data.region}
                onPatch={(patch) => setData((d) => ({ ...d, ...patch }))}
              />
            ) : type.key === "career" ? (
              <CareerContent
                editing={editing}
                showPreview={showPreview}
                items={data.career}
                onPatch={patchCareer}
                onAdd={addCareer}
                onRemove={removeCareer}
              />
            ) : type.key === "awards" ? (
              <AwardContent
                editing={editing}
                showPreview={showPreview}
                items={data.awards}
                onPatch={patchAward}
                onAdd={addAward}
                onRemove={removeAward}
              />
            ) : type.key === "stats" ? (
              <EducationContent
                editing={editing}
                showPreview={showPreview}
                items={data.stats}
                onPatch={patchEdu}
                onAdd={addEdu}
                onRemove={removeEdu}
              />
            ) : type.key === "photos" ? (
              <PhotosContent
                editing={editing}
                photos={photos}
                uploading={photosUploading}
                onAdd={addPhotos}
                onRemove={removePhoto}
              />
            ) : type.key === "menus" ? (
              <MenuContent
                editing={editing}
                showPreview={showPreview}
                items={data.menus}
                onPatch={patchMenu}
                onAdd={addMenus}
                onRemove={removeMenu}
              />
            ) : null}
          </SectionShell>
        ))}

        {false && (
          <>
        {isVisible("contacts") && (
          <section className="mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Sparkles size={16} className="text-[#999f54]" />
              관심분야
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("contacts")}
                  aria-label="관심분야 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <ul className="space-y-3 text-sm">
              {data.contacts.map((c, i) => {
                const Icon = c.kind === "ig" ? AtSign : c.kind === "web" ? Globe : Mail;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <Icon size={18} className="text-text-5 shrink-0" />
                    <TextField
                      value={c.value}
                      editing={editing}
                      onChange={(v) => patchItem("contacts", i, { value: v })}
                      className="text-text-1 flex-1"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {isVisible("photos") && (
          <section className="mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1 mb-3">
              <Camera size={16} className="text-[#999f54]" />
              사진
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSection("photos")}
                  aria-label="사진 제거"
                  className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-normal text-text-6 hover:text-red-500"
                >
                  <X size={12} /> 제거
                </button>
              )}
            </h2>
            <PhotoUpload />
          </section>
        )}
          </>
        )}
        </>
        )}

      </main>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="항목 추가"
        size="sm"
      >
        {availableSections.length === 0 ? (
          <p className="text-xs text-text-5">추가할 수 있는 항목을 모두 추가했어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableSections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => addSection(s.key)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-black/15 dark:border-white/15 bg-surface text-left hover:border-[#999f54] hover:bg-[#999f54]/5 transition-colors"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-[#999f54]">
                  <Plus size={14} />
                </span>
                <span className="flex-1 min-w-0 text-sm font-medium text-text-2">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        title="순서 바꾸기"
        size="sm"
      >
        <p className="text-xs text-text-5 mb-3">
          길게 눌러 드래그하면 순서를 바꿀 수 있어요.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedSectionTypes.map((t) => t.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {orderedSectionTypes.map((t) => (
                <ReorderRow key={t.key} type={t} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setReorderOpen(false)}
            className="text-sm px-4 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] hover:bg-[#8a9049]"
          >
            완료
          </button>
        </div>
      </Modal>

      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="항목 제거"
        size="sm"
      >
        <p className="text-sm text-text-2 leading-relaxed">
          이 카드 안의 내용이 모두 사라져요. 계속할까요?
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setRemoveTarget(null)}
            className="text-sm px-4 py-2 rounded-full border border-black/15 dark:border-white/15 text-text-1 hover:bg-black/5 dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirmRemoveSection}
            className="text-sm px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            제거
          </button>
        </div>
      </Modal>

      {pendingAvatarFile && (
        <AvatarCropper
          file={pendingAvatarFile}
          onCancel={() => setPendingAvatarFile(null)}
          onConfirm={handleAvatarConfirm}
        />
      )}
    </>
  );
}
