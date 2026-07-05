import Link from "next/link";
import { Compass, Home } from "lucide-react";

export const metadata = {
  title: "Seite nicht gefunden",
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass animate-slide-up w-full max-w-sm rounded-3xl p-8 text-center">
        <Compass className="mx-auto mb-4 size-10 text-muted" aria-hidden />
        <h1 className="text-lg font-semibold">Seite nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted">
          Die Seite, die du suchst, gibt es nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-transform active:scale-95"
        >
          <Home className="size-4" aria-hidden />
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
