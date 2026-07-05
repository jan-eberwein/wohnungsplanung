"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeSplitDetails } from "@/lib/balance";
import { getBalance } from "@/lib/data/purchases";
import { getCurrentProfile, getProfiles } from "@/lib/data/profiles";
import { uploadImage, UploadError } from "@/lib/data/storage";
import { normalizeName, type SplitType } from "@/lib/types";

function parseAmount(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

/**
 * „Einkauf abschließen": bucht den Betrag mit Split, hängt die abgehakten
 * Artikel als Beleg-Positionen an, übernimmt sie in den Vorrat und räumt
 * die Einkaufsliste auf.
 *
 * FormData-Felder: total_amount, paid_by, split_type,
 * share_<profileId> (bei custom), full_bearer (bei full), note, receipt (Datei)
 */
export async function completePurchase(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const totalAmount = parseAmount(formData.get("total_amount"));
  if (totalAmount === null || totalAmount <= 0) {
    return { error: "Bitte einen gültigen Betrag eingeben." };
  }

  const profiles = await getProfiles();
  const paidBy = String(formData.get("paid_by") ?? "");
  const payer = profiles.find((p) => p.id === paidBy);
  const other = profiles.find((p) => p.id !== paidBy);
  if (!payer || !other) return { error: "Ungültige Auswahl, wer bezahlt hat." };

  const splitType = String(formData.get("split_type") ?? "50_50") as SplitType;
  if (!["50_50", "custom", "full"].includes(splitType)) {
    return { error: "Ungültige Split-Auswahl." };
  }

  let customShares: Record<string, number> | undefined;
  if (splitType === "custom") {
    customShares = {};
    for (const p of profiles) {
      customShares[p.id] = parseAmount(formData.get(`share_${p.id}`)) ?? 0;
    }
    const shares = Object.values(customShares);
    if (shares.some((share) => share < 0 || share > totalAmount)) {
      return {
        error:
          "Die Anteile müssen zwischen 0 € und dem Gesamtbetrag liegen.",
      };
    }
    const sum = shares.reduce((acc, x) => acc + x, 0);
    if (Math.abs(sum - totalAmount) > 0.02) {
      return {
        error: "Die Anteile müssen zusammen den Gesamtbetrag ergeben.",
      };
    }
  }

  let fullBearerId: string | undefined;
  if (splitType === "full") {
    fullBearerId = String(formData.get("full_bearer") ?? payer.id);
    if (!profiles.some((p) => p.id === fullBearerId)) {
      return { error: "Ungültige Auswahl, für wen der Einkauf ist." };
    }
  }

  const receipt = formData.get("receipt");
  let receiptPath: string | null = null;
  if (receipt instanceof File && receipt.size > 0) {
    try {
      receiptPath = await uploadImage("receipts", receipt);
    } catch (error) {
      return {
        error:
          error instanceof UploadError
            ? error.message
            : "Der Beleg konnte nicht hochgeladen werden.",
      };
    }
  }

  const note = String(formData.get("note") ?? "").trim() || null;
  const splitDetails = computeSplitDetails(
    splitType,
    totalAmount,
    payer.id,
    other.id,
    { customShares, fullBearerId }
  );

  const supabase = await createClient();
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      total_amount: totalAmount,
      paid_by: payer.id,
      split_type: splitType,
      split_details: splitDetails,
      receipt_path: receiptPath,
      note,
    })
    .select()
    .single();
  if (purchaseError || !purchase) {
    return { error: purchaseError?.message ?? "Einkauf konnte nicht gespeichert werden." };
  }

  // Abgehakte Artikel: als Positionen sichern, in den Vorrat übernehmen,
  // dann von der Einkaufsliste entfernen.
  const { data: checkedItems } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("is_checked", true);

  if (checkedItems && checkedItems.length > 0) {
    await supabase.from("purchase_items").insert(
      checkedItems.map((item) => ({
        purchase_id: purchase.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }))
    );

    const { data: pantryItems } = await supabase.from("pantry_items").select("*");
    for (const item of checkedItems) {
      const match = (pantryItems ?? []).find(
        (pantryItem) =>
          normalizeName(pantryItem.name) === normalizeName(item.name)
      );
      const addedQuantity = item.quantity ?? 1;
      if (match) {
        await supabase
          .from("pantry_items")
          .update({
            quantity: match.quantity + addedQuantity,
            unit: match.unit ?? item.unit,
            low_stock: false,
          })
          .eq("id", match.id);
      } else {
        await supabase.from("pantry_items").insert({
          name: item.name,
          quantity: addedQuantity,
          unit: item.unit,
        });
      }
    }

    await supabase.from("shopping_items").delete().eq("is_checked", true);
  }

  revalidatePath("/", "layout");
  return {};
}

/** Offenen Saldo als beglichen markieren. */
export async function settleBalance(): Promise<{ error?: string }> {
  const balance = await getBalance();
  if (!balance.creditor || !balance.debtor || balance.amount <= 0) {
    return { error: "Es ist nichts offen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("settlements").insert({
    amount: balance.amount,
    from_profile: balance.debtor.id,
    to_profile: balance.creditor.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/** Einkauf aus der Historie löschen (Vorrat bleibt unverändert). */
export async function deletePurchase(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
