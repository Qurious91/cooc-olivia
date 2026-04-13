"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  fullHeight?: boolean;
  children: ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  fullHeight = false,
  children,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${SIZE[size]} ${
          fullHeight ? "h-[80vh]" : ""
        } p-6 shadow-xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-1">{title}</h2>
            <button onClick={onClose} className="p-1 text-text-5" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
