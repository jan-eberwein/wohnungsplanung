import type { Metadata } from "next";
import { LoginCards } from "@/components/login/LoginCards";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 pt-safe pb-safe">
      <main className="w-full max-w-md animate-fade-in py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Wohnungsplanung</h1>
          <p className="mt-2 text-sm text-muted">
            Einkaufsliste, Ausgaben, Vorrat &amp; Rezepte — alles an einem Ort.
          </p>
        </header>
        <LoginCards />
      </main>
    </div>
  );
}
