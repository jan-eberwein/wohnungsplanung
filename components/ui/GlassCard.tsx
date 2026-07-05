export type GlassCardProps = React.ComponentProps<"div"> & {
  /** Kräftigere Glasfläche (glass-strong) für hervorgehobene Flächen */
  strong?: boolean;
};

export function GlassCard({
  strong = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={[
        strong ? "glass-strong" : "glass",
        "rounded-3xl",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
