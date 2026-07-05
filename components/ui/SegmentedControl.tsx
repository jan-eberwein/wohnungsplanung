"use client";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  className?: string;
  "aria-label"?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={["glass flex rounded-full p-1", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={[
              "min-h-10 flex-1 rounded-full px-4 text-sm transition-colors",
              active
                ? "bg-surface-strong font-semibold text-foreground shadow-sm"
                : "font-medium text-muted hover:text-foreground",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
