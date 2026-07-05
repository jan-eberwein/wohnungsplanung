"use client";

import { Check } from "lucide-react";

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "group flex min-h-11 items-center gap-3 text-left",
        "disabled:pointer-events-none disabled:opacity-50",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className={[
          "flex size-6 shrink-0 items-center justify-center rounded-lg border transition-colors",
          checked
            ? "border-accent bg-accent"
            : "border-line bg-surface group-hover:border-accent/50",
        ].join(" ")}
      >
        {checked && (
          <Check
            className="animate-pop size-4 text-accent-contrast"
            strokeWidth={3}
          />
        )}
      </span>
      {label != null && (
        <span
          className={[
            "text-sm transition-colors",
            checked ? "text-muted line-through" : "text-foreground",
          ].join(" ")}
        >
          {label}
        </span>
      )}
    </button>
  );
}
