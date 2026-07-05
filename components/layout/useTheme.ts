"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage nicht verfügbar (z. B. Private Mode) — Fallback auf System.
  }
  return "system";
}

/**
 * Theme-Hook laut Konventionen: liest/schreibt localStorage("theme") und
 * toggelt die .dark-Klasse auf <html>. Bei "system" folgt er matchMedia.
 */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  // Initial aus localStorage lesen (nur am Client, lazy Initializer statt Effect).
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : readStoredTheme()
  );

  // Bei "system" auf Änderungen der OS-Einstellung reagieren.
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("theme", t);
    } catch {
      // Speichern optional — Anzeige funktioniert trotzdem.
    }
    applyTheme(t);
  }, []);

  return { theme, setTheme };
}
