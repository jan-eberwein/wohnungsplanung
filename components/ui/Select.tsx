"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

export type SelectProps = React.ComponentProps<"select"> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={[
            "min-h-11 w-full appearance-none rounded-2xl border bg-surface pl-4 pr-10 text-base text-foreground",
            "outline-none transition-colors",
            "focus:border-accent focus:ring-2 focus:ring-accent/25",
            "disabled:opacity-50",
            error ? "border-danger" : "border-line",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
