"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, ShoppingBasket, X } from "lucide-react";
import { completePurchase } from "@/lib/actions/purchases";
import { formatEuro } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import type { Profile, SplitType } from "@/lib/types";

function parseAmount(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

type ProfilePickerProps = {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

/** Zwei Avatar-Buttons; die Auswahl bekommt einen Ring in der Nutzerfarbe. */
function ProfilePicker({
  profiles,
  selectedId,
  onSelect,
  disabled,
}: ProfilePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {profiles.map((profile) => {
        const active = profile.id === selectedId;
        return (
          <button
            key={profile.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(profile.id)}
            aria-pressed={active}
            style={
              active
                ? {
                    boxShadow: `0 0 0 2px ${profile.accent_color}, 0 0 0 6px ${profile.accent_color}33`,
                  }
                : undefined
            }
            className={[
              "glass flex min-h-14 items-center justify-center gap-2.5 rounded-2xl px-3 py-3",
              "transition-transform duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
              active ? "font-semibold" : "font-medium text-muted",
            ].join(" ")}
          >
            <Avatar
              name={profile.display_name}
              color={profile.accent_color}
              size="sm"
            />
            <span className="truncate">{profile.display_name}</span>
          </button>
        );
      })}
    </div>
  );
}

export type CompletePurchaseCardProps = {
  profiles: Profile[];
  /** Anzahl der aktuell abgehakten Artikel auf der Einkaufsliste */
  checkedCount: number;
};

export function CompletePurchaseCard({
  profiles,
  checkedCount,
}: CompletePurchaseCardProps) {
  const router = useRouter();
  const { show } = useToast();
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<SplitType>("50_50");
  const [shares, setShares] = useState<Record<string, string>>({});
  const [fullBearer, setFullBearer] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = parseAmount(amount);

  // Live-Validierung für den individuellen Split
  const customSum = round2(
    profiles.reduce(
      (sum, profile) => sum + (parseAmount(shares[profile.id] ?? "") ?? 0),
      0
    )
  );
  const customRemainder = total === null ? null : round2(total - customSum);
  const customValid =
    customRemainder !== null && Math.abs(customRemainder) <= 0.02;

  const effectiveFullBearer = fullBearer ?? paidBy ?? profiles[0]?.id ?? null;

  const canSubmit =
    total !== null &&
    total > 0 &&
    paidBy !== null &&
    (splitType !== "custom" || customValid) &&
    (splitType !== "full" || effectiveFullBearer !== null);

  function clearReceipt() {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceipt(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    if (file && file.size > 0) {
      setReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
    } else {
      setReceipt(null);
      setReceiptPreview(null);
    }
  }

  function resetForm() {
    setAmount("");
    setPaidBy(null);
    setSplitType("50_50");
    setShares({});
    setFullBearer(null);
    setNote("");
    clearReceipt();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isPending || !paidBy) return;

    const formData = new FormData();
    formData.set("total_amount", amount);
    formData.set("paid_by", paidBy);
    formData.set("split_type", splitType);
    if (splitType === "custom") {
      for (const profile of profiles) {
        formData.set(`share_${profile.id}`, shares[profile.id] ?? "");
      }
    }
    if (splitType === "full" && effectiveFullBearer) {
      formData.set("full_bearer", effectiveFullBearer);
    }
    if (note.trim()) formData.set("note", note.trim());
    if (receipt) formData.set("receipt", receipt);

    startTransition(async () => {
      const result = await completePurchase(formData);
      if (result?.error) {
        show(result.error, "error");
        return;
      }
      show("Einkauf gespeichert");
      resetForm();
      router.refresh();
    });
  }

  return (
    <GlassCard strong className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15">
          <ShoppingBasket className="size-5 text-accent" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Einkauf abschließen</h2>
          {checkedCount > 0 ? (
            <p className="mt-0.5 text-sm text-muted">
              {checkedCount === 1
                ? "1 abgehakter Artikel wandert in den Vorrat."
                : `${checkedCount} abgehakte Artikel wandern in den Vorrat.`}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted">
              Keine abgehakten Artikel auf der Liste — du kannst trotzdem einen
              Betrag buchen.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Betrag */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="purchase-amount"
            className="text-sm font-medium text-foreground"
          >
            Betrag
          </label>
          <div className="relative">
            <input
              id="purchase-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={amount}
              disabled={isPending}
              onChange={(event) => setAmount(event.target.value)}
              className={[
                "min-h-16 w-full rounded-2xl border border-line bg-surface pl-5 pr-14",
                "text-3xl font-bold text-foreground placeholder:text-muted/60",
                "outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25",
                "disabled:opacity-50",
              ].join(" ")}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted"
            >
              €
            </span>
          </div>
        </div>

        {/* Wer hat bezahlt? */}
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-foreground">
            Wer hat bezahlt?
          </legend>
          <ProfilePicker
            profiles={profiles}
            selectedId={paidBy}
            onSelect={setPaidBy}
            disabled={isPending}
          />
        </fieldset>

        {/* Split */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            Wie wird geteilt?
          </legend>
          <SegmentedControl<SplitType>
            aria-label="Aufteilung wählen"
            value={splitType}
            onChange={setSplitType}
            options={[
              { value: "50_50", label: "50/50" },
              { value: "custom", label: "Individuell" },
              { value: "full", label: "Eine Person" },
            ]}
          />

          {splitType === "custom" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                {profiles.map((profile) => (
                  <Input
                    key={profile.id}
                    label={profile.display_name}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    value={shares[profile.id] ?? ""}
                    disabled={isPending}
                    onChange={(event) =>
                      setShares((current) => ({
                        ...current,
                        [profile.id]: event.target.value,
                      }))
                    }
                  />
                ))}
              </div>
              {total === null ? (
                <p className="text-xs text-muted">
                  Gib zuerst den Gesamtbetrag ein.
                </p>
              ) : customValid ? (
                <p className="text-xs font-medium text-success">
                  Passt — die Anteile ergeben {formatEuro(total)}.
                </p>
              ) : customRemainder !== null && customRemainder > 0 ? (
                <p className="text-xs font-medium text-warning">
                  Noch {formatEuro(customRemainder)} zu verteilen.
                </p>
              ) : (
                <p className="text-xs font-medium text-danger">
                  {formatEuro(Math.abs(customRemainder ?? 0))} zu viel verteilt.
                </p>
              )}
            </div>
          )}

          {splitType === "full" && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted">Wer übernimmt die Kosten?</p>
              <ProfilePicker
                profiles={profiles}
                selectedId={effectiveFullBearer}
                onSelect={setFullBearer}
                disabled={isPending}
              />
            </div>
          )}
        </fieldset>

        {/* Beleg-Foto */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Beleg (optional)
          </span>
          <input
            ref={fileInputRef}
            id="purchase-receipt"
            type="file"
            accept="image/*"
            capture="environment"
            disabled={isPending}
            onChange={handleReceiptChange}
            className="sr-only"
          />
          {receiptPreview ? (
            <div className="relative inline-block">
              {/* Lokale Blob-Vorschau — next/image ist hier nicht nötig */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptPreview}
                alt="Beleg-Vorschau"
                className="size-24 rounded-2xl border border-line object-cover"
              />
              <button
                type="button"
                onClick={clearReceipt}
                disabled={isPending}
                aria-label="Beleg entfernen"
                className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform active:scale-90"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <label
              htmlFor="purchase-receipt"
              className="glass flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <Camera className="size-4" aria-hidden />
              Foto aufnehmen oder auswählen
            </label>
          )}
        </div>

        {/* Notiz */}
        <Textarea
          label="Notiz (optional)"
          placeholder="z. B. Wocheneinkauf beim Hofer"
          rows={2}
          value={note}
          disabled={isPending}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-20"
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isPending}
          disabled={!canSubmit}
        >
          Einkauf abschließen
        </Button>
      </form>
    </GlassCard>
  );
}
