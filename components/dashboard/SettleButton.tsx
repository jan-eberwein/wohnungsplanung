"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { settleBalance } from "@/lib/actions/purchases";

export type SettleButtonProps = {
  /** Beschreibung im Bestätigungs-Dialog, z. B. Betrag + Richtung */
  description: string;
};

/** Markiert den offenen Saldo nach Bestätigung als beglichen. */
export function SettleButton({ description }: SettleButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  function handleConfirm() {
    startTransition(async () => {
      const result = await settleBalance();
      if (result.error) {
        show(result.error, "error");
        return;
      }
      show("Saldo beglichen – ihr seid quitt.");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="secondary"
        fullWidth
        loading={pending}
        onClick={() => setOpen(true)}
      >
        Als beglichen markieren
      </Button>
      <ConfirmDialog
        open={open}
        title="Saldo begleichen?"
        description={description}
        confirmLabel="Ja, beglichen"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
