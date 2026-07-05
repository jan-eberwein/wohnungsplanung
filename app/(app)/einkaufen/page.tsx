import type { Metadata } from "next";
import { getBalance, getMonthStats, getPurchases } from "@/lib/data/purchases";
import { getProfiles } from "@/lib/data/profiles";
import { getShoppingItems } from "@/lib/data/shopping";
import { PageHeader } from "@/components/ui/PageHeader";
import { BalanceSection } from "@/components/purchases/BalanceSection";
import { CompletePurchaseCard } from "@/components/purchases/CompletePurchaseCard";
import { MonthStatsCard } from "@/components/purchases/MonthStatsCard";
import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";

export const metadata: Metadata = {
  title: "Einkaufen & Ausgaben",
};

export default async function EinkaufenPage() {
  const [purchases, balance, stats, profiles, shoppingItems] =
    await Promise.all([
      getPurchases(),
      getBalance(),
      getMonthStats(),
      getProfiles(),
      getShoppingItems(),
    ]);
  const checkedCount = shoppingItems.filter((item) => item.is_checked).length;

  return (
    <>
      <PageHeader
        title="Einkaufen & Ausgaben"
        description="Einkäufe buchen, Kosten teilen und den Saldo im Blick behalten"
      />
      <div className="space-y-6 pb-6">
        <CompletePurchaseCard profiles={profiles} checkedCount={checkedCount} />
        <BalanceSection balance={balance} profiles={profiles} />
        <MonthStatsCard stats={stats} />
        <PurchaseHistory purchases={purchases} profiles={profiles} />
      </div>
    </>
  );
}
