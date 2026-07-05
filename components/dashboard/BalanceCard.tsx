import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatEuro } from "@/lib/format";
import type { BalanceInfo, Profile } from "@/lib/types";
import { SettleButton } from "@/components/dashboard/SettleButton";

export type BalanceCardProps = {
  balance: BalanceInfo;
  /** Beide Profile für den Quitt-Zustand */
  profiles: Profile[];
};

export function BalanceCard({ balance, profiles }: BalanceCardProps) {
  const { creditor, debtor, amount } = balance;

  if (!creditor || !debtor) {
    return (
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-muted">Saldo</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex -space-x-2">
            {profiles.map((profile) => (
              <Avatar
                key={profile.id}
                name={profile.display_name}
                color={profile.accent_color}
                size="lg"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold">Ihr seid quitt</p>
            <p className="text-sm text-muted">Gerade ist nichts offen.</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <h2 className="text-sm font-semibold text-muted">Saldo</h2>
      <p className="mt-3 text-sm text-muted">
        <span className="font-semibold text-foreground">
          {debtor.display_name}
        </span>{" "}
        schuldet{" "}
        <span className="font-semibold text-foreground">
          {creditor.display_name}
        </span>
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight">
        {formatEuro(amount)}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <Avatar
          name={debtor.display_name}
          color={debtor.accent_color}
          size="lg"
        />
        <div className="relative flex-1">
          <div
            aria-hidden
            className="h-1.5 rounded-full"
            style={{
              background: `linear-gradient(to right, ${debtor.accent_color}, ${creditor.accent_color})`,
            }}
          />
          <span className="glass-strong absolute left-1/2 top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
            <ArrowRight className="size-4 text-muted" aria-hidden />
          </span>
        </div>
        <Avatar
          name={creditor.display_name}
          color={creditor.accent_color}
          size="lg"
        />
      </div>

      <div className="mt-5">
        <SettleButton
          description={`${formatEuro(amount)} von ${debtor.display_name} an ${creditor.display_name} – danach seid ihr wieder quitt.`}
        />
      </div>
    </GlassCard>
  );
}
