import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profiles";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div
      style={{ "--accent": profile.accent_color } as React.CSSProperties}
      className="min-h-dvh"
    >
      <AppShell profile={profile}>{children}</AppShell>
    </div>
  );
}
