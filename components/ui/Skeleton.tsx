export type SkeletonProps = React.ComponentProps<"div">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={["animate-pulse rounded-2xl bg-foreground/8", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
