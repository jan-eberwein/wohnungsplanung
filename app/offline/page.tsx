import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        <WifiOff className="mx-auto mb-4 size-10 text-muted" aria-hidden />
        <h1 className="text-lg font-semibold">Du bist offline</h1>
        <p className="mt-2 text-sm text-muted">
          Sobald du wieder Internet hast, kannst du weitermachen.
        </p>
      </div>
    </main>
  );
}
