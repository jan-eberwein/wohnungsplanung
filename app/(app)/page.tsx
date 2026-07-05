import { redirect } from "next/navigation";
import { getCurrentProfile, getProfiles } from "@/lib/data/profiles";
import { getLowStockItems } from "@/lib/data/pantry";
import { getBalance } from "@/lib/data/purchases";
import { getRecipesWithCookability } from "@/lib/data/recipes";
import { getOpenItemCount } from "@/lib/data/shopping";
import { formatDate, formatWeekday } from "@/lib/format";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { LowStockCard } from "@/components/dashboard/LowStockCard";
import { RecipeSuggestions } from "@/components/dashboard/RecipeSuggestions";
import { ShoppingListCard } from "@/components/dashboard/ShoppingListCard";

export default async function DashboardPage() {
  const [profile, profiles, balance, lowStockItems, recipes, openCount] =
    await Promise.all([
      getCurrentProfile(),
      getProfiles(),
      getBalance(),
      getLowStockItems(),
      getRecipesWithCookability(),
      getOpenItemCount(),
    ]);
  if (!profile) redirect("/login");

  const nowIso = new Date().toISOString();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted">
          {formatWeekday(nowIso)} · {formatDate(nowIso)}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Hallo {profile.display_name}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
        <BalanceCard balance={balance} profiles={profiles} />
        <LowStockCard items={lowStockItems} />
        <div className="md:col-span-2">
          <RecipeSuggestions recipes={recipes} />
        </div>
        <div className="md:col-span-2">
          <ShoppingListCard openCount={openCount} />
        </div>
      </div>
    </div>
  );
}
