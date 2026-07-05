"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrierung schlägt z. B. im Dev-Modus über HTTP fehl – unkritisch.
      });
    }
  }, []);

  return null;
}
