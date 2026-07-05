type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  /** Anzeigename; der erste Buchstabe wird als Initiale gezeigt */
  name: string;
  /** Akzentfarbe (z. B. profile.accent_color); Fallback: var(--accent) */
  color?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

export function Avatar({ name, color, size = "md", className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      title={name}
      style={{ backgroundColor: color ?? "var(--accent)" }}
      className={[
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white shadow-sm ring-1 ring-white/30",
        sizeClasses[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {initial}
    </span>
  );
}
