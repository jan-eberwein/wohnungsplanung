"use client";

import { AlertTriangle, ChevronDown, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass animate-slide-up w-full max-w-sm rounded-3xl p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 size-10 text-danger" aria-hidden />
        <h1 className="text-lg font-semibold">Da ist was schiefgelaufen</h1>
        <p className="mt-2 text-sm text-muted">
          Ein unerwarteter Fehler ist aufgetreten. Versuch es einfach nochmal.
        </p>

        <details className="group mt-4 text-left">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 text-sm font-medium text-muted [&::-webkit-details-marker]:hidden">
            Details anzeigen
            <ChevronDown
              className="size-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-background/60 p-3">
            <code className="block whitespace-pre-wrap break-words font-mono text-xs text-muted">
              {error.message || "Keine Fehlermeldung vorhanden."}
              {error.digest ? `\n\nDigest: ${error.digest}` : ""}
            </code>
          </div>
        </details>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-transform active:scale-95"
        >
          <RotateCcw className="size-4" aria-hidden />
          Nochmal versuchen
        </button>
      </div>
    </main>
  );
}
