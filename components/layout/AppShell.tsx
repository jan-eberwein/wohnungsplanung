import type { Profile } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";

/**
 * App-Shell: mobil Tab-Bar unten, ab md Sidebar links.
 * Der Content-Container übernimmt alle Abstände inkl. Platz für die Tab-Bar —
 * Seiten müssen sich nicht selbst um mb-tabbar kümmern.
 */
export function AppShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <Sidebar profile={profile} />
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pt-safe md:px-8">
          <div className="mb-tabbar pt-4 md:pt-8">{children}</div>
        </main>
      </div>
      <TabBar />
    </div>
  );
}
