"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  emoji?: string;
};

type PickerBottomSheetProps<T extends string> = {
  open: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption<T>[];
  selectedValue: T | "";
  onSelect: (value: T) => void;
};

export function PickerBottomSheet<T extends string>({
  open,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: PickerBottomSheetProps<T>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="picker-sheet-root" role="presentation">
      <button
        type="button"
        className="picker-sheet-backdrop"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="picker-sheet-panel"
      >
        <div className="picker-sheet-handle" aria-hidden />
        <p id={titleId} className="picker-sheet-title">
          {title}
        </p>
        <ul className="picker-sheet-list">
          {options.map((opt) => {
            const selected = selectedValue === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`picker-sheet-option ${selected ? "is-selected" : ""}`}
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                >
                  {opt.emoji && (
                    <span className="picker-sheet-option-emoji" aria-hidden>
                      {opt.emoji}
                    </span>
                  )}
                  <span className="picker-sheet-option-label">{opt.label}</span>
                  {selected && (
                    <span className="picker-sheet-option-check" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="picker-sheet-cancel" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
