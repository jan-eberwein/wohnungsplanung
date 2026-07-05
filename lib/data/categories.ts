import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
});
