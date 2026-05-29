"use client";

import { useMemo, useState } from "react";

import { PickerBottomSheet } from "@/components/explore/PickerBottomSheet";

const GENDER_OPTIONS = [
  { value: "female" as const, label: "여성", emoji: "👩" },
  { value: "male" as const, label: "남성", emoji: "👨" },
];

export type GenderValue = "" | "female" | "male";

function normalizeGender(value: string): GenderValue {
  if (value === "female" || value === "male") return value;
  return "";
}

type GenderPickerProps = {
  value: GenderValue | string;
  onChange: (value: GenderValue) => void;
};

export function GenderPicker({ value, onChange }: GenderPickerProps) {
  const [open, setOpen] = useState(false);
  const safeValue = normalizeGender(value);

  const selected = useMemo(
    () => GENDER_OPTIONS.find((o) => o.value === safeValue),
    [safeValue]
  );

  return (
    <div className="space-y-1">
      <button
        type="button"
        className={`picker-field-trigger ${selected ? "has-value" : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="picker-field-trigger-text">
          {selected ? (
            <>
              <span className="picker-field-emoji" aria-hidden>
                {selected.emoji}
              </span>
              {selected.label}
            </>
          ) : (
            "성별 선택"
          )}
        </span>
        <span className="picker-field-chevron" aria-hidden>
          ▼
        </span>
      </button>

      <PickerBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="성별을 선택해 주세요"
        options={GENDER_OPTIONS}
        selectedValue={safeValue}
        onSelect={onChange}
      />
    </div>
  );
}
