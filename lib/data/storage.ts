import { createClient } from "@/lib/supabase/server";

export type ImageBucket = "receipts" | "recipes";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

// Erlaubte Bildtypen → sichere Dateiendung. Die Endung wird aus dem MIME-Typ
// abgeleitet, nicht aus dem (vom Client kontrollierten) Dateinamen, damit über
// die signierte URL kein aktives HTML/SVG ausgeliefert werden kann.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export class UploadError extends Error {}

export async function uploadImage(
  bucket: ImageBucket,
  file: File
): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    throw new UploadError(
      "Nur Bilder (JPG, PNG, WebP oder HEIC) sind als Foto erlaubt."
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Das Bild ist zu groß (maximal 10 MB).");
  }

  const supabase = await createClient();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
  });
  if (error) throw new UploadError(`Upload fehlgeschlagen: ${error.message}`);
  return path;
}

export async function getSignedUrl(
  bucket: ImageBucket,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function deleteImage(
  bucket: ImageBucket,
  path: string | null
): Promise<void> {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
}
