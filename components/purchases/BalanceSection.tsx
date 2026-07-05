"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { settleBalance } from "@/lib/actions/purchases";
import { formatEuro } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";
import type { BalanceInfo, Profile } from "@/lib/types";

export type BalanceSectionProps = {
  balance: BalanceInfo;
  /** Beide Profile — für die Anzeige, wenn der Saldo ausgeglichen ist */
  profiles: Profile[];
};

export function BalanceSection({ balance, profiles }: BalanceSectionProps) {
  const router = useRouter();
  const { show } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { creditor, debtor, amount } = balance;
  const settled = !creditor || !debtor || amount <= 0;

  function handleSettle() {
    startTransition(async () => {
      const result = await settleBalance();
      if (result?.error) {
        show(result.error, "error");
        return;
      }
      show("Saldo beglichen");
      router.refresh();
    });
  }

  const [left, right] = settled ? profiles : [debtor, creditor];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Saldo</h2>
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          {left && (
            <div className="flex flex-col items-center gap-1">
              <Avatar
                name={left.display_name}
                color={left.accent_color}
                size="lg"
              />
              <span className="text-xs font-medium text-muted">
                {left.display_name}
              </span>
            </div>
          )}

          <div className="relative flex-1">
            <div
              aria-hidden
              className="h-2.5 rounded-full"
              style={
                left && right
                  ? {
                      background: `linear-gradient(to right, ${left.accent_color}, ${right.accent_color})`,
                      opacity: settled ? 0.35 : 1,
                    }
                  : undefined
              }
            />
            <span
              aria-hidden
              className="glass-strong absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            >
              {settled ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <ArrowRight className="size-4 text-foreground" />
              )}
            </span>
          </div>

          {right && (
            <div className="flex flex-col items-center gap-1">
              <Avatar
                name={right.display_name}
                color={right.accent_color}
                size="lg"
              />
              <span className="text-xs font-medium text-muted">
                {right.display_name}
              </span>
            </div>
          )}
        </div>

        {settled ? (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm font-medium text-success">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Ihr seid quitt
          </p>
        ) : (
          <>
            <p className="mt-4 text-center text-sm">
              {debtor.display_name} schuldet {creditor.display_name}{" "}
              <span className="font-bold">{formatEuro(amount)}</span>
            </p>
            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              loading={isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Als beglichen markieren
            </Button>
          </>
        )}
      </GlassCard>

      {!settled && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Saldo begleichen?"
          description={`${debtor.display_name} zahlt ${creditor.display_name} ${formatEuro(
            amount
          )}. Danach steht der Saldo wieder auf null.`}
          confirmLabel="Als beglichen markieren"
          onConfirm={handleSettle}
        />
      )}
    </section>
  );
}
