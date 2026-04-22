import { X } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "brand" | "status" | "outline";

const BASE =
  "inline-flex items-center gap-[0.35em] px-[0.7em] py-[0.15em] rounded-full text-base border leading-snug whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  brand:
    "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border-[#999f54]/25",
  outline:
    "bg-transparent border-black/15 dark:border-white/15 text-text-3",
  status: "",
};

const STATUS_COLORS: Record<string, string> = {
  active:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  suspended:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  recruiting:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  in_progress:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  done:
    "bg-black/5 text-text-5 border-black/10 dark:bg-white/5 dark:text-text-5 dark:border-white/10",
  cancelled:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function Chip({
  children,
  variant = "brand",
  status,
  leadingIcon,
  onRemove,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  status?: string;
  leadingIcon?: ReactNode;
  onRemove?: () => void;
  className?: string;
}) {
  const variantClass =
    variant === "status"
      ? STATUS_COLORS[status ?? ""] ??
        "bg-black/5 text-text-5 border-black/10 dark:bg-white/5 dark:border-white/10"
      : VARIANTS[variant];

  return (
    <span className={`${BASE} ${variantClass} ${className}`}>
      {leadingIcon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="제거"
          className="inline-flex items-center text-current opacity-70 hover:opacity-100"
        >
          <X size="0.85em" />
        </button>
      )}
    </span>
  );
}
