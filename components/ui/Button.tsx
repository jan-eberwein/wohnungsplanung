"use client";

import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Zeigt einen Spinner und deaktiviert den Button */
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent/90 active:bg-accent/85",
  secondary:
    "border border-line bg-surface text-foreground backdrop-blur-xl hover:bg-surface-strong",
  ghost: "text-foreground hover:bg-foreground/5 active:bg-foreground/10",
  danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger/85",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
        "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
      )}
      {children}
    </button>
  );
}
