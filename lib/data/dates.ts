import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/data/storage";
import { toDateString } from "@/lib/format";
import type {
  DateEntry,
  DateEntryFull,
  DateIdea,
  DatePhoto,
  DatePhotoWithUrl,
} from "@/lib/types";

const DATE_SELECT =
  "*, photos:date_photos(*), created_by_profile:profiles(id, username, display_name, accent_color)";

type DateRow = Omit<DateEntryFull, "photos"> & { photos: DatePhoto[] };

async function withSignedPhotos(row: DateRow): Promise<DateEntryFull> {
  const photos = [...row.photos].sort((a, b) => a.sort_order - b.sort_order);
  const signed: DatePhotoWithUrl[] = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      url: await getSignedUrl("dates", photo.image_path),
    }))
  );
  return { ...row, photos: signed };
}

/** Katalog aller Date-Ideen, gruppiert nach Kategorie sortierbar */
export async function getDateIdeas(): Promise<DateIdea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("date_ideas")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Date-Ideen laden fehlgeschlagen: ${error.message}`);
  }
  return data ?? [];
}

/** Alle konkreten Dates (geplant + erledigt) inkl. Fotos und Ersteller-Profil */
export async function getDates(): Promise<DateEntryFull[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dates")
    .select(DATE_SELECT)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Dates laden fehlgeschlagen: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as DateRow[];
  return Promise.all(rows.map(withSignedPhotos));
}

/** Das nächste anstehende geplante Date (mit Termin ab heute), für das Dashboard. */
export async function getNextPlannedDate(): Promise<DateEntry | null> {
  const supabase = await createClient();
  const today = toDateString(new Date());
  const { data } = await supabase
    .from("dates")
    .select("*")
    .eq("status", "geplant")
    .not("scheduled_for", "is", null)
    .gte("scheduled_for", today)
    .order("scheduled_for", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function getDate(id: string): Promise<DateEntryFull | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dates")
    .select(DATE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return withSignedPhotos(data as unknown as DateRow);
}
