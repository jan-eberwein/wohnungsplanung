import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { ThemeCard } from "@/components/settings/ThemeCard";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { LogoutCard } from "@/components/settings/LogoutCard";
import { AboutCard } from "@/components/settings/AboutCard";
import { getCategories } from "@/lib/data/categories";
import { getCurrentProfile } from "@/lib/data/profiles";

export const metadata: Metadata = {
  title: "Einstellungen",
};

export default async function EinstellungenPage() {
  const [profile, categories] = await Promise.all([
    getCurrentProfile(),
    getCategories(),
  ]);
  if (!profile) redirect("/login");

  return (
    <>
      <PageHeader
        title="Einstellungen"
        description="Profil, Darstellung und Kategorien"
      />
      <div className="flex flex-col gap-4 pb-8">
        <ProfileCard profile={profile} />
        <ThemeCard />
        <CategoryManager categories={categories} />
        <LogoutCard />
        <AboutCard />
      </div>
    </>
  );
}
