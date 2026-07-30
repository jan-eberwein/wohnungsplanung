"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, X } from "lucide-react";
import { saveDateLog } from "@/lib/actions/dates";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { toDateString } from "@/lib/format";
import type { DateEntryFull } from "@/lib/types";

export type CompleteDateModalProps = {
  open: boolean;
  date: DateEntryFull | null;
  onClose: () => void;
};

type NewPhoto = { key: number; file: File; url: string };

export function CompleteDateModal({
  open,
  date,
  onClose,
}: CompleteDateModalProps) {
  const router = useRouter();
  const { show } = useToast();

  const isEdit = date?.status === "erledigt";

  const [completedOn, setCompletedOn] = useState("");
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const nextKey = useRef(0);
  const objectUrls = useRef<string[]>([]);

  // Beim Öffnen aus dem Date vorbefüllen (bzw. für frische Erledigung leeren).
  useEffect(() => {
    if (!open || !date) return;
    setCompletedOn(date.completed_on ?? toDateString(new Date()));
    setRating(date.rating ?? 0);
    setLocation(date.location ?? "");
    setNotes(date.notes ?? "");
    setRemovedIds([]);
    setNewPhotos([]);
  }, [open, date]);

  // Object-URLs beim Unmount freigeben.
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleAddPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const added = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return { key: nextKey.current++, file, url };
    });
    setNewPhotos((current) => [...current, ...added]);
    event.target.value = "";
  }

  function removeNewPhoto(key: number) {
    setNewPhotos((current) => current.filter((photo) => photo.key !== key));
  }

  function toggleRemoveExisting(id: string) {
    setRemovedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    );
  }

  async function handleSubmit() {
    if (!date || submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("completed_on", completedOn);
    formData.set("location", location);
    formData.set("notes", notes);
    if (rating > 0) formData.set("rating", String(rating));
    formData.set("removedPhotoIds", JSON.stringify(removedIds));
    newPhotos.forEach((photo) => formData.append("photos", photo.file));

    const result = await saveDateLog(date.id, formData);
    setSubmitting(false);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    show(isEdit ? "Erinnerung aktualisiert." : "Als erledigt gespeichert 🎉");
    onClose();
    router.refresh();
  }

  const existingPhotos = date?.photos ?? [];

  return (
    <Modal
      open={open && date !== null}
      onClose={onClose}
      title={isEdit ? "Erinnerung bearbeiten" : "Date festhalten"}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Abbrechen
          </Button>
          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            {isEdit ? "Speichern" : "Erledigt speichern"}
          </Button>
        </div>
      }
    >
      {date && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {date.emoji ?? "💫"}
            </span>
            <p className="text-base font-semibold">{date.title}</p>
          </div>

          <Input
            type="date"
            label="Wann war's?"
            value={completedOn}
            onChange={(event) => setCompletedOn(event.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Wie war's?
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(rating === value ? 0 : value)}
                    aria-label={`${value} Sterne`}
                    aria-pressed={value <= rating}
                    className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-warning/10"
                  >
                    <Star
                      className={`size-7 ${
                        value <= rating
                          ? "fill-warning text-warning"
                          : "text-line"
                      }`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Ort (optional)"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="z. B. Alte Donau, Wien"
          />

          <Textarea
            label="Notizen & Erinnerungen"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Was war schön? Woran wollt ihr euch erinnern?"
            rows={4}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Fotos</span>
            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="grid grid-cols-3 gap-2">
                {existingPhotos.map((photo) => {
                  const removed = removedIds.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      className="relative aspect-square overflow-hidden rounded-xl"
                    >
                      {photo.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo.url}
                          alt="Foto"
                          className={`h-full w-full object-cover transition-opacity ${
                            removed ? "opacity-30" : ""
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleRemoveExisting(photo.id)}
                        aria-label={removed ? "Behalten" : "Entfernen"}
                        className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                      {removed && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-medium text-white">
                          wird entfernt
                        </span>
                      )}
                    </div>
                  );
                })}
                {newPhotos.map((photo) => (
                  <div
                    key={photo.key}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Neues Foto"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(photo.key)}
                      aria-label="Foto entfernen"
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="block cursor-pointer">
              <span className="sr-only">Fotos hinzufügen</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="sr-only"
              />
              <span className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-strong hover:text-foreground">
                <ImagePlus className="size-5" aria-hidden />
                Fotos hinzufügen
              </span>
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
