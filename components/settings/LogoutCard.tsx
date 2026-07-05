"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { logout } from "@/lib/actions/auth";

/** Abmelden-Sektion: Danger-Ghost-Button mit Bestätigungsdialog. */
export function LogoutCard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <GlassCard className="p-3">
      <Button
        variant="ghost"
        fullWidth
        loading={pending}
        onClick={() => setConfirmOpen(true)}
        className="hover:bg-danger/10 active:bg-danger/15"
        style={{ color: "var(--danger)" }}
      >
        <LogOut className="size-4" aria-hidden />
        Abmelden
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Wirklich abmelden?"
        description="Du kannst dich jederzeit wieder anmelden."
        confirmLabel="Abmelden"
        danger
        onConfirm={() =>
          startTransition(async () => {
            await logout();
          })
        }
        onClose={() => setConfirmOpen(false)}
      />
    </GlassCard>
  );
}
