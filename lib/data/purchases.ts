import { createClient } from "@/lib/supabase/server";
import { computeBalance } from "@/lib/balance";
import { getProfiles } from "@/lib/data/profiles";
import { getSignedUrl } from "@/lib/data/storage";
import type { BalanceInfo, MonthStats, PurchaseFull } from "@/lib/types";

const PURCHASE_SELECT =
  "*, payer:profiles(id, username, display_name, accent_color), items:purchase_items(*)";

export async function getPurchases(limit = 50): Promise<PurchaseFull[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Einkäufe laden fehlgeschlagen: ${error.message}`);

  const purchases = (data ?? []) as unknown as Omit<PurchaseFull, "receipt_url">[];
  return Promise.all(
    purchases.map(async (purchase) => ({
      ...purchase,
      receipt_url: await getSignedUrl("receipts", purchase.receipt_path),
    }))
  );
}

export async function getBalance(): Promise<BalanceInfo> {
  const supabase = await createClient();
  const [profiles, purchasesResult, settlementsResult] = await Promise.all([
    getProfiles(),
    supabase.from("purchases").select("*"),
    supabase.from("settlements").select("*"),
  ]);
  return computeBalance(
    profiles,
    purchasesResult.data ?? [],
    settlementsResult.data ?? []
  );
}

/** Statistik für den aktuellen Kalendermonat */
export async function getMonthStats(): Promise<MonthStats> {
  const supabase = await createClient();
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("purchases")
    .select("total_amount")
    .gte("created_at", start.toISOString());

  const amounts = (data ?? []).map((row) => row.total_amount);
  const total = Math.round(amounts.reduce((sum, x) => sum + x, 0) * 100) / 100;
  const count = amounts.length;
  return {
    total,
    count,
    average: count > 0 ? Math.round((total / count) * 100) / 100 : 0,
  };
}
