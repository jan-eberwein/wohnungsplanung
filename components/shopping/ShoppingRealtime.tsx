"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Lauscht auf Supabase-Realtime-Änderungen an shopping_items und
 * aktualisiert die Server-Daten per router.refresh().
 */
export function ShoppingRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("shopping")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
