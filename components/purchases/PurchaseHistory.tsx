"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ReceiptText, Trash2 } from "lucide-react";
import { deletePurchase } from "@/lib/actions/purchases";
import { formatDate, formatEuro, formatQuantity } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Profile, PurchaseFull } from "@/lib/types";

export type PurchaseHistoryProps = {
  purchases: PurchaseFull[];
  /** Beide Profile — für die Split-Kurzinfo bei "Eine Person" */
  profiles: Profile[];
};

/** Kurzinfo zur Aufteilung, z. B. "50/50", "Individuell", "Nur Jan" */
function splitLabel(purchase: PurchaseFull, profiles: Profile[]): string {
  if (purchase.split_type === "50_50") return "50/50";
  if (purchase.split_type === "custom") return "Individuell";
  const details = purchase.split_details as Record<string, number> | null;
  const bearer = details
    ? profiles.find((profile) => (details[profile.id] ?? 0) > 0)
    : undefined;
  return bearer ? `Nur ${bearer.display_name}` : "Eine Person";
}

export function PurchaseHistory({ purchases, profiles }: PurchaseHistoryProps) {
  const router = useRouter();
  const { show } = useToast();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseFull | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  function handleDelete(purchase: PurchaseFull) {
    startTransition(async () => {
      const result = await deletePurchase(purchase.id);
      if (result?.error) {
        show(result.error, "error");
        return;
      }
      show("Einkauf gelöscht");
      router.refresh();
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Historie</h2>

      {purchases.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={ReceiptText}
            title="Noch keine Einkäufe"
            description="Schließe deinen ersten Einkauf ab — danach findest du ihn hier."
          />
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {purchases.map((purchase) => {
            const expanded = expandedId === purchase.id;
            return (
              <li key={purchase.id}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={purchase.payer.display_name}
                      color={purchase.payer.accent_color}
                      size="md"
                      className="mt-0.5"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-base font-bold">
                          {formatEuro(purchase.total_amount)}
                        </span>
                        <Badge>{splitLabel(purchase, profiles)}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(purchase.created_at)} ·{" "}
                        {purchase.payer.display_name} hat bezahlt
                      </p>
                      {purchase.note && (
                        <p className="mt-1 break-words text-sm text-muted">
                          {purchase.note}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {purchase.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setReceiptUrl(purchase.receipt_url)}
                          aria-label="Beleg ansehen"
                          className="relative size-11 overflow-hidden rounded-xl border border-line transition-transform active:scale-95"
                        >
                          <Image
                            src={purchase.receipt_url}
                            alt="Beleg-Miniatur"
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(purchase)}
                        disabled={isPending}
                        aria-label="Einkauf löschen"
                        className="flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 className="size-4.5" aria-hidden />
                      </button>
                    </div>
                  </div>

                  {purchase.items.length > 0 && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : purchase.id)
                        }
                        aria-expanded={expanded}
                        className="flex min-h-10 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                      >
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        />
                        {purchase.items.length === 1
                          ? "1 Artikel"
                          : `${purchase.items.length} Artikel`}
                      </button>
                      {expanded && (
                        <ul className="animate-fade-in mt-1 space-y-1 border-t border-line pt-2">
                          {purchase.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-baseline justify-between gap-3 text-sm"
                            >
                              <span className="min-w-0 truncate">
                                {item.name}
                              </span>
                              <span className="shrink-0 text-muted">
                                {formatQuantity(item.quantity, item.unit)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Einkauf löschen?"
        description={
          deleteTarget
            ? `Der Einkauf über ${formatEuro(
                deleteTarget.total_amount
              )} wird aus der Historie entfernt. Der Vorrat bleibt unverändert.`
            : undefined
        }
        confirmLabel="Löschen"
        danger
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />

      <Modal
        open={receiptUrl !== null}
        onClose={() => setReceiptUrl(null)}
        title="Beleg"
      >
        {receiptUrl && (
          <div className="relative h-[60dvh] w-full overflow-hidden rounded-2xl">
            <Image
              src={receiptUrl}
              alt="Beleg in groß"
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-contain"
            />
          </div>
        )}
      </Modal>
    </section>
  );
}
