import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Optionale Aktion, z. B. ein Button */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="glass flex size-14 items-center justify-center rounded-full">
        <Icon className="size-6 text-muted" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
