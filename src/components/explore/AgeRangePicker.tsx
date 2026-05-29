"use client";

import { useMemo, useState } from "react";

import { PickerBottomSheet } from "@/components/explore/PickerBottomSheet";

const AGE_OPTIONS = [
  { value: "10s" as const, label: "10대" },
  { value: "20s" as const, label: "20대" },
  { value: "30s" as const, label: "30대" },
  { value: "40s" as const, label: "40대" },
  { value: "50plus" as const, label: "50대+" },
];

export type AgeRangeValue = "" | "10s" | "20s" | "30s" | "40s" | "50plus";

type AgeRangePickerProps = {
  value: AgeRangeValue;
  onChange: (value: AgeRangeValue) => void;
};

export function AgeRangePicker({ value, onChange }: AgeRangePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => AGE_OPTIONS.find((o) => o.value === value), [value]);

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
          {selected ? selected.label : "연령대 선택"}
        </span>
        <span className="picker-field-chevron" aria-hidden>
          ▼
        </span>
      </button>

      <PickerBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="연령대를 선택해 주세요"
        options={AGE_OPTIONS}
        selectedValue={value}
        onSelect={onChange}
      />
    </div>
  );
}
