"use client";

import { useEffect, useRef, useState } from "react";

const FRAME = 256;
const OUTPUT = 512;
const JPEG_QUALITY = 0.88;

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

export default function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      const s = Math.max(FRAME / el.width, FRAME / el.height);
      setImg(el);
      setMinScale(s);
      setScale(s);
      setTx((FRAME - el.width * s) / 2);
      setTy((FRAME - el.height * s) / 2);
    };
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clamp = (t: number, s: number, dim: number) => {
    const sized = dim * s;
    if (sized <= FRAME) return (FRAME - sized) / 2;
    return Math.max(FRAME - sized, Math.min(0, t));
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
    };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st || !img) return;
    setTx(clamp(st.startTx + (e.clientX - st.startX), scale, img.width));
    setTy(clamp(st.startTy + (e.clientY - st.startY), scale, img.height));
  };
  const onUp = () => {
    dragRef.current = null;
  };

  const onScaleChange = (nextScale: number) => {
    if (!img) return;
    const cx = FRAME / 2;
    const cy = FRAME / 2;
    const imgCx = (cx - tx) / scale;
    const imgCy = (cy - ty) / scale;
    const nextTx = cx - imgCx * nextScale;
    const nextTy = cy - imgCy * nextScale;
    setScale(nextScale);
    setTx(clamp(nextTx, nextScale, img.width));
    setTy(clamp(nextTy, nextScale, img.height));
  };

  const confirm = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const srcX = -tx / scale;
    const srcY = -ty / scale;
    const srcSize = FRAME / scale;
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl p-5 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-text-1 mb-3">프로필 사진 편집</h3>
        <div
          className="relative mx-auto bg-black select-none overflow-hidden touch-none cursor-grab active:cursor-grabbing"
          style={{ width: FRAME, height: FRAME }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {img && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: img.width * scale,
                height: img.height * scale,
                transform: `translate(${tx}px, ${ty}px)`,
              }}
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
          />
          <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-white/70" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-text-5">
          <span>축소</span>
          <input
            type="range"
            min={minScale}
            max={minScale * 4}
            step={0.01}
            value={scale}
            disabled={!img}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="flex-1 accent-[#999f54]"
          />
          <span>확대</span>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-full border border-black/15 dark:border-white/15 text-text-1 hover:bg-black/5 dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!img}
            className="text-sm px-4 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] disabled:opacity-50"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
