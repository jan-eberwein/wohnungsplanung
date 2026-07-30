"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarHeart } from "lucide-react";
import { planDate } from "@/lib/actions/dates";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { toDateString } from "@/lib/format";

export type PlanTarget = {
  ideaId: string | null;
  title: string;
  emoji: string | null;
  category: string | null;
};

export type PlanDateModalProps = {
  open: boolean;
  target: PlanTarget | null;
  onClose: () => void;
};

export function PlanDateModal({ open, target, onClose }: PlanDateModalProps) {
  const router = useRouter();
  const { show } = useToast();
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setDate(toDateString(new Date()));
  }, [open]);

  async function handleSubmit() {
    if (!target || submitting) return;
    setSubmitting(true);
    try {
      const result = await planDate({
        ideaId: target.ideaId,
        title: target.title,
        emoji: target.emoji,
        category: target.category,
        scheduledFor: date || null,
      });
      if (result.error) {
        show(result.error, "error");
        return;
      }
      show("Date eingeplant 💕");
      onClose();
      router.refresh();
    } catch {
      show("Einplanen fehlgeschlagen. Bitte erneut versuchen.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open && target !== null}
      onClose={onClose}
      title="Date einplanen"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Abbrechen
          </Button>
          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            <CalendarHeart className="size-4" aria-hidden />
            Einplanen
          </Button>
        </div>
      }
    >
      {target && (
        <div className="flex flex-col gap-4">
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <span className="text-3xl" aria-hidden>
              {target.emoji ?? "💫"}
            </span>
            <p className="text-base font-semibold">{target.title}</p>
          </div>
          <Input
            type="date"
            label="Wann wollt ihr das machen?"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
