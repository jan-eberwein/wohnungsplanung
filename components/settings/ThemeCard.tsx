"use client";

import { useSyncExternalStore } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/ui/SegmentedControl";
import { useTheme, type Theme } from "@/components/layout/useTheme";

// Hydration-Erkennung: Server-Snapshot false, Client-Snapshot true.
const emptySubscribe = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

const themeOptions: SegmentedControlOption<Theme>[] = [
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
  { value: "system", label: "System" },
];

/**
 * Darstellungs-Sektion mit Theme-Umschalter.
 * Der SegmentedControl wird erst nach dem Mount gerendert, weil das Theme
 * aus localStorage kommt und sonst ein Hydration-Mismatch entstehen würde.
 */
export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getMounted,
    getServerMounted
  );

  return (
    <GlassCard className="p-5">
      <h2 className="text-base font-semibold">Darstellung</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Wähle, wie die App aussehen soll.
      </p>
      {mounted ? (
        <SegmentedControl
          value={theme}
          onChange={setTheme}
          options={themeOptions}
          aria-label="Theme wählen"
        />
      ) : (
        <div className="glass h-12 rounded-full" aria-hidden />
      )}
    </GlassCard>
  );
}
