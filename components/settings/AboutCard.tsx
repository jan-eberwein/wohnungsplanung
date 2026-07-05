import { GlassCard } from "@/components/ui/GlassCard";

/** Über-die-App-Sektion: Name, Version und Widmung, bewusst dezent. */
export function AboutCard() {
  return (
    <GlassCard className="p-5 text-center">
      <p className="text-sm font-semibold text-muted">Wohnungsplanung</p>
      <p className="mt-1 text-xs text-muted">Version 1.0.0</p>
      <p className="mt-0.5 text-xs text-muted">Für Jan &amp; Sophie</p>
    </GlassCard>
  );
}
