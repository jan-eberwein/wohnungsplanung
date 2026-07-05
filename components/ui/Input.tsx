"use client";

import { useId } from "react";

export type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={[
          "min-h-11 w-full rounded-2xl border bg-surface px-4 text-base text-foreground",
          "placeholder:text-muted outline-none transition-colors",
          "focus:border-accent focus:ring-2 focus:ring-accent/25",
          "disabled:opacity-50",
          error ? "border-danger" : "border-line",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
