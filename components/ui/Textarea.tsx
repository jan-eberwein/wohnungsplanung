"use client";

import { useId } from "react";

export type TextareaProps = React.ComponentProps<"textarea"> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={[
          "min-h-24 w-full resize-y rounded-2xl border bg-surface px-4 py-3 text-base text-foreground",
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
