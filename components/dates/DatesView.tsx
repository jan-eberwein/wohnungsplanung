"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AddIdeaModal } from "@/components/dates/AddIdeaModal";
import { CompleteDateModal } from "@/components/dates/CompleteDateModal";
import { DoneView } from "@/components/dates/DoneView";
import { IdeaBrowser } from "@/components/dates/IdeaBrowser";
import { PlanDateModal, type PlanTarget } from "@/components/dates/PlanDateModal";
import { PlannedList } from "@/components/dates/PlannedList";
import type { DateEntryFull, DateIdea } from "@/lib/types";

export type DatesViewProps = {
  ideas: DateIdea[];
  planned: DateEntryFull[];
  done: DateEntryFull[];
};

type Tab = "ideen" | "geplant" | "erledigt";

export function DatesView({ ideas, planned, done }: DatesViewProps) {
  const [tab, setTab] = useState<Tab>("ideen");
  const [planTarget, setPlanTarget] = useState<PlanTarget | null>(null);
  const [completeDate, setCompleteDate] = useState<DateEntryFull | null>(null);
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl<Tab>
        aria-label="Dates-Ansicht"
        value={tab}
        onChange={setTab}
        options={[
          { value: "ideen", label: "Ideen" },
          {
            value: "geplant",
            label: `Geplant${planned.length ? ` (${planned.length})` : ""}`,
          },
          {
            value: "erledigt",
            label: `Erledigt${done.length ? ` (${done.length})` : ""}`,
          },
        ]}
      />

      {tab === "ideen" && (
        <IdeaBrowser
          ideas={ideas}
          onPlan={setPlanTarget}
          onAddIdea={() => setAddIdeaOpen(true)}
        />
      )}
      {tab === "geplant" && (
        <PlannedList planned={planned} onComplete={setCompleteDate} />
      )}
      {tab === "erledigt" && <DoneView done={done} />}

      <PlanDateModal
        open={planTarget !== null}
        target={planTarget}
        onClose={() => setPlanTarget(null)}
      />
      <CompleteDateModal
        open={completeDate !== null}
        date={completeDate}
        onClose={() => setCompleteDate(null)}
      />
      <AddIdeaModal open={addIdeaOpen} onClose={() => setAddIdeaOpen(false)} />
    </div>
  );
}
