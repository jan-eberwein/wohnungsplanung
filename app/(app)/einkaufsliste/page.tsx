import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getShoppingItems } from "@/lib/data/shopping";
import { getCategories } from "@/lib/data/categories";
import { getCurrentProfile } from "@/lib/data/profiles";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShoppingRealtime } from "@/components/shopping/ShoppingRealtime";
import { ShoppingView } from "@/components/shopping/ShoppingView";

export const metadata: Metadata = {
  title: "Einkaufsliste",
};

export default async function EinkaufslistePage() {
  const [items, categories, profile] = await Promise.all([
    getShoppingItems(),
    getCategories(),
    getCurrentProfile(),
  ]);
  // Ohne Profil zum Login umleiten (wie in den übrigen Seiten).
  if (!profile) redirect("/login");

  return (
    <>
      <PageHeader title="Einkaufsliste" />
      <ShoppingRealtime />
      <ShoppingView items={items} categories={categories} profile={profile} />
    </>
  );
}
