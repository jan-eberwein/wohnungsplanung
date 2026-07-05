"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  /** Beschriftung des Bestätigen-Buttons (Standard: "Bestätigen") */
  confirmLabel?: string;
  /** Rote Gefahr-Optik für destruktive Aktionen */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Bestätigen",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description ? (
        <p className="text-sm text-muted">{description}</p>
      ) : null}
    </Modal>
  );
}
