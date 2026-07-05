"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optionaler Fußbereich, z. B. für Aktions-Buttons */
  footer?: React.ReactNode;
};

/**
 * Mobil als Bottom-Sheet (Slide-up), ab md zentriert.
 * Schließt per Backdrop-Klick, X-Button und Escape.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="animate-fade-in absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className="glass-strong animate-slide-up pointer-events-auto flex max-h-[85dvh] w-full flex-col rounded-t-3xl md:max-w-md md:rounded-3xl"
        >
          <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3">
            {title ? (
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            {children}
          </div>
          {footer && (
            <div className="border-t border-line px-5 py-4">{footer}</div>
          )}
          <div className="pb-safe md:hidden" />
        </div>
      </div>
    </div>,
    document.body
  );
}
