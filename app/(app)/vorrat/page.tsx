import type { Metadata } from "next";
import { getPantryItems } from "@/lib/data/pantry";
import { PageHeader } from "@/components/ui/PageHeader";
import { PantryView } from "@/components/pantry/PantryView";

export const metadata: Metadata = {
  title: "Vorrat",
};

export default async function VorratPage() {
  const items = await getPantryItems();

  return (
    <>
      <PageHeader
        title="Vorrat"
        description={
          items.length > 0 ? `${items.length} Artikel zuhause` : undefined
        }
      />
      <PantryView items={items} />
    </>
  );
}
