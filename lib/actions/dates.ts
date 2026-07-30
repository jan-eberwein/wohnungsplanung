"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profiles";
import { deleteImage, uploadImage, UploadError } from "@/lib/data/storage";
import { toDateString } from "@/lib/format";

export type PlanDateInput = {
  /** Katalog-Idee, aus der geplant wird; null bei eigener Idee */
  ideaId?: string | null;
  title: string;
  emoji?: string | null;
  category?: string | null;
  /** Geplantes Datum als YYYY-MM-DD; null = ohne festen Termin */
  scheduledFor?: string | null;
};

/** Plant ein Date ein (Status "geplant"). Titel/Emoji/Kategorie werden aus der
 *  Idee kopiert, damit das Date spätere Änderungen der Idee überdauert. */
export async function planDate(
  input: PlanDateInput
): Promise<{ error?: string; dateId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();

  let title = input.title?.trim() ?? "";
  let emoji = input.emoji ?? null;
  let category = input.category ?? null;

  if (input.ideaId) {
    const { data: idea } = await supabase
      .from("date_ideas")
      .select("title, emoji, category")
      .eq("id", input.ideaId)
      .maybeSingle();
    if (idea) {
      title = idea.title;
      emoji = idea.emoji;
      category = idea.category;
    }
  }

  if (!title) return { error: "Bitte einen Titel eingeben." };

  const { data, error } = await supabase
    .from("dates")
    .insert({
      idea_id: input.ideaId ?? null,
      title,
      emoji,
      category,
      status: "geplant",
      scheduled_for: input.scheduledFor || null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { error: error?.message ?? "Date konnte nicht geplant werden." };
  }

  revalidatePath("/", "layout");
  return { dateId: data.id };
}

/** Verschiebt ein geplantes Date auf ein anderes Datum. */
export async function rescheduleDate(
  dateId: string,
  scheduledFor: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("dates")
    .update({ scheduled_for: scheduledFor || null })
    .eq("id", dateId);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

function parseRating(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || !raw) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 5) return null;
  return value;
}

async function uploadDatePhotos(
  files: File[]
): Promise<{ paths: string[]; error?: string }> {
  const paths: string[] = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    try {
      paths.push(await uploadImage("dates", file));
    } catch (error) {
      // Bereits hochgeladene Fotos wieder entfernen, damit nichts verwaist.
      await Promise.all(paths.map((path) => deleteImage("dates", path)));
      return {
        paths: [],
        error:
          error instanceof UploadError
            ? error.message
            : "Ein Foto konnte nicht hochgeladen werden.",
      };
    }
  }
  return { paths };
}

/**
 * Speichert die Erinnerung zu einem Date und markiert es als erledigt.
 * Bei dateId = null wird ein neues (bereits erledigtes) Date angelegt – so
 * lassen sich auch vergangene Dates direkt eintragen.
 *
 * FormData: title, emoji, category, ideaId, completed_on, location, notes,
 * rating, photos (mehrere Dateien), removedPhotoIds (JSON-Array).
 */
export async function saveDateLog(
  dateId: string | null,
  formData: FormData
): Promise<{ error?: string; dateId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();

  const completedOn =
    String(formData.get("completed_on") ?? "").trim() ||
    toDateString(new Date());
  const location = String(formData.get("location") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const rating = parseRating(formData.get("rating"));

  let id = dateId;

  if (id) {
    const { error } = await supabase
      .from("dates")
      .update({
        status: "erledigt",
        completed_on: completedOn,
        location,
        notes,
        rating,
      })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Bitte einen Titel eingeben." };
    const { data, error } = await supabase
      .from("dates")
      .insert({
        idea_id: (String(formData.get("ideaId") ?? "").trim() || null) as
          | string
          | null,
        title,
        emoji: String(formData.get("emoji") ?? "").trim() || null,
        category: String(formData.get("category") ?? "").trim() || null,
        status: "erledigt",
        completed_on: completedOn,
        location,
        notes,
        rating,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (error || !data) {
      return { error: error?.message ?? "Date konnte nicht gespeichert werden." };
    }
    id = data.id;
  }

  // Entfernte Fotos löschen (DB-Zeilen + Storage-Objekte).
  const removedRaw = formData.get("removedPhotoIds");
  if (typeof removedRaw === "string" && removedRaw) {
    try {
      const removedIds = JSON.parse(removedRaw) as string[];
      if (Array.isArray(removedIds) && removedIds.length > 0) {
        const { data: rows } = await supabase
          .from("date_photos")
          .select("id, image_path")
          .in("id", removedIds)
          .eq("date_id", id);
        await supabase.from("date_photos").delete().in(
          "id",
          (rows ?? []).map((row) => row.id)
        );
        await Promise.all(
          (rows ?? []).map((row) => deleteImage("dates", row.image_path))
        );
      }
    } catch {
      // Ungültiges JSON ignorieren – der Rest wird trotzdem gespeichert.
    }
  }

  // Neue Fotos hochladen und anhängen.
  const files = formData.getAll("photos").filter((entry): entry is File =>
    entry instanceof File
  );
  if (files.length > 0) {
    const { paths, error } = await uploadDatePhotos(files);
    if (error) return { error };
    if (paths.length > 0) {
      const { data: existing } = await supabase
        .from("date_photos")
        .select("sort_order")
        .eq("date_id", id)
        .order("sort_order", { ascending: false })
        .limit(1);
      let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
      const { error: photoError } = await supabase.from("date_photos").insert(
        paths.map((path) => ({
          date_id: id!,
          image_path: path,
          sort_order: nextOrder++,
        }))
      );
      if (photoError) {
        await Promise.all(paths.map((path) => deleteImage("dates", path)));
        return { error: photoError.message };
      }
    }
  }

  revalidatePath("/", "layout");
  return { dateId: id! };
}

export async function deleteDate(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("date_photos")
    .select("image_path")
    .eq("date_id", id);

  const { error } = await supabase.from("dates").delete().eq("id", id);
  if (error) return { error: error.message };

  await Promise.all(
    (photos ?? []).map((photo) => deleteImage("dates", photo.image_path))
  );

  revalidatePath("/", "layout");
  return {};
}

/** Fügt dem Katalog eine eigene Date-Idee hinzu. */
export async function createCustomIdea(input: {
  title: string;
  emoji?: string | null;
  category?: string | null;
}): Promise<{ error?: string; ideaId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const title = input.title?.trim();
  if (!title) return { error: "Bitte einen Titel eingeben." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("date_ideas")
    .insert({
      title,
      emoji: input.emoji?.trim() || null,
      category: input.category?.trim() || "sonstiges",
      is_custom: true,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { error: error?.message ?? "Idee konnte nicht gespeichert werden." };
  }

  revalidatePath("/", "layout");
  return { ideaId: data.id };
}
