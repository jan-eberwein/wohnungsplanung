import { Star } from "lucide-react";

export type StarsProps = {
  value: number | null;
  /** Pixelgröße pro Stern */
  size?: number;
  className?: string;
};

/** Nicht-interaktive Sterne-Anzeige (server- und client-tauglich). */
export function Stars({ value, size = 16, className }: StarsProps) {
  if (!value) return null;
  return (
    <span
      className={["inline-flex items-center gap-0.5", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${value} von 5 Sternen`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          className={
            index < value ? "fill-warning text-warning" : "text-line"
          }
          aria-hidden
        />
      ))}
    </span>
  );
}
