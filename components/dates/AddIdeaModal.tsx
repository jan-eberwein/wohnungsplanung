"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomIdea } from "@/lib/actions/dates";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { DATE_CATEGORIES, type DateCategoryKey } from "@/lib/types";

export type AddIdeaModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddIdeaModal({ open, onClose }: AddIdeaModalProps) {
  const router = useRouter();
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<DateCategoryKey>("sonstiges");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    if (!title.trim()) {
      show("Bitte einen Titel eingeben.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createCustomIdea({
        title,
        emoji: emoji || null,
        category,
      });
      if (result.error) {
        show(result.error, "error");
        return;
      }
      show("Eigene Idee hinzugefügt.");
      setTitle("");
      setEmoji("");
      setCategory("sonstiges");
      onClose();
      router.refresh();
    } catch {
      show("Speichern fehlgeschlagen. Bitte erneut versuchen.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eigene Date-Idee"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Abbrechen
          </Button>
          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            Hinzufügen
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="w-20 shrink-0">
            <Input
              label="Emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value.slice(0, 4))}
              placeholder="💫"
              className="text-center text-xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label="Titel"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="z. B. Gemeinsam Sushi rollen"
              autoFocus
            />
          </div>
        </div>
        <Select
          label="Kategorie"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as DateCategoryKey)
          }
        >
          {DATE_CATEGORIES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.emoji} {item.label}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
