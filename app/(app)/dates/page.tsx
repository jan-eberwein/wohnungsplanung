import type { Metadata } from "next";
import { getDateIdeas, getDates } from "@/lib/data/dates";
import { PageHeader } from "@/components/ui/PageHeader";
import { DatesView } from "@/components/dates/DatesView";

export const metadata: Metadata = {
  title: "Dates",
};

export default async function DatesPage() {
  const [ideas, dates] = await Promise.all([getDateIdeas(), getDates()]);
  const planned = dates.filter((date) => date.status === "geplant");
  const done = dates.filter((date) => date.status === "erledigt");

  return (
    <div className="flex flex-col gap-2 pb-8">
      <PageHeader
        title="Dates"
        description="Ideen sammeln, einplanen und Erinnerungen festhalten 💕"
      />
      <DatesView ideas={ideas} planned={planned} done={done} />
    </div>
  );
}
