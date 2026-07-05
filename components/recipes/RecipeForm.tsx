"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { saveRecipe } from "@/lib/actions/recipes";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

const TAG_SUGGESTIONS = ["vegetarisch", "schnell", "Lieblingsessen"];

export type RecipeFormInitial = {
  title: string;
  instructions: string;
  tags: string[];
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
  /** Bestehendes Foto (signierte URL); bleibt erhalten, wenn kein neues gewählt wird */
  imageUrl: string | null;
};

export type RecipeFormProps = {
  /** null/undefined = neues Rezept anlegen */
  recipeId?: string;
  initial?: RecipeFormInitial;
};

type IngredientRow = {
  key: number;
  name: string;
  quantity: string;
  unit: string;
};

function buildInitialRows(initial?: RecipeFormInitial): IngredientRow[] {
  const ingredients = initial?.ingredients ?? [];
  if (ingredients.length === 0) {
    return [{ key: 0, name: "", quantity: "", unit: "" }];
  }
  return ingredients.map((ingredient, index) => ({
    key: index,
    name: ingredient.name,
    quantity:
      ingredient.quantity === null
        ? ""
        : String(ingredient.quantity).replace(".", ","),
    unit: ingredient.unit ?? "",
  }));
}

export function RecipeForm({ recipeId, initial }: RecipeFormProps) {
  const router = useRouter();
  const { show } = useToast();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [rows, setRows] = useState<IngredientRow[]>(() =>
    buildInitialRows(initial)
  );
  const [rowsError, setRowsError] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.imageUrl ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  const nextKey = useRef(rows.length);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setImageFile(file);
    setPreview(url);
  }

  const currentTags = tagsText
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  function addSuggestedTag(tag: string) {
    setTagsText((previous) => {
      const trimmed = previous.trim().replace(/,\s*$/, "");
      return trimmed ? `${trimmed}, ${tag}` : tag;
    });
  }

  function updateRow(key: number, patch: Partial<IngredientRow>) {
    setRowsError(undefined);
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      { key: nextKey.current++, name: "", quantity: "", unit: "" },
    ]);
  }

  function removeRow(key: number) {
    setRows((current) =>
      current.length > 1 ? current.filter((row) => row.key !== key) : current
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Bitte gib einen Titel ein.");
      return;
    }
    const filledRows = rows.filter((row) => row.name.trim());
    if (filledRows.length === 0) {
      setRowsError("Bitte gib mindestens eine Zutat an.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("title", trimmedTitle);
    formData.set("instructions", instructions);
    formData.set("tags", tagsText);
    formData.set(
      "ingredients",
      JSON.stringify(
        filledRows.map((row) => {
          const rawQuantity = row.quantity.trim().replace(",", ".");
          const quantity = rawQuantity ? Number(rawQuantity) : NaN;
          return {
            name: row.name.trim(),
            quantity: Number.isFinite(quantity) ? quantity : null,
            unit: row.unit.trim() || null,
          };
        })
      )
    );
    if (imageFile) formData.set("image", imageFile);

    const result = await saveRecipe(recipeId ?? null, formData);
    if (result.error || !result.recipeId) {
      setSubmitting(false);
      show(result.error ?? "Speichern fehlgeschlagen.", "error");
      return;
    }
    show(recipeId ? "Rezept gespeichert." : "Rezept angelegt.");
    router.push(`/rezepte/${result.recipeId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <GlassCard className="flex flex-col gap-5 p-5">
        <Input
          label="Titel"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setTitleError(undefined);
          }}
          placeholder="z. B. Spaghetti Carbonara"
          error={titleError}
          autoFocus={!recipeId}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Foto</span>
          <label className="block cursor-pointer">
            <span className="sr-only">Foto auswählen</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
            <span className="relative block aspect-video overflow-hidden rounded-2xl border border-dashed border-line bg-surface transition-colors hover:bg-surface-strong">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Foto-Vorschau"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                  <ImagePlus className="size-6" aria-hidden />
                  <span className="text-sm font-medium">Foto auswählen</span>
                </span>
              )}
            </span>
          </label>
          <p className="text-xs text-muted">
            {preview
              ? "Tippe auf das Bild, um ein anderes Foto zu wählen."
              : "Optional – macht das Rezept gleich viel appetitlicher."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            label="Tags"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="z. B. vegetarisch, schnell"
            hint="Mehrere Tags mit Komma trennen"
          />
          <div className="flex flex-wrap gap-1.5">
            {TAG_SUGGESTIONS.filter(
              (tag) => !currentTags.includes(tag.toLowerCase())
            ).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addSuggestedTag(tag)}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-strong hover:text-foreground"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-medium text-foreground">Zutaten</h2>
        {rows.map((row) => (
          <div key={row.key} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Zutat"
                placeholder="Zutat"
                value={row.name}
                onChange={(event) =>
                  updateRow(row.key, { name: event.target.value })
                }
              />
            </div>
            <div className="w-20 shrink-0">
              <Input
                aria-label="Menge"
                placeholder="Menge"
                inputMode="decimal"
                value={row.quantity}
                onChange={(event) =>
                  updateRow(row.key, { quantity: event.target.value })
                }
              />
            </div>
            <div className="w-20 shrink-0">
              <Input
                aria-label="Einheit"
                placeholder="Einheit"
                value={row.unit}
                onChange={(event) =>
                  updateRow(row.key, { unit: event.target.value })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              disabled={rows.length === 1}
              aria-label={`Zutat ${row.name || "ohne Namen"} entfernen`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        {rowsError && (
          <p className="text-xs font-medium text-danger">{rowsError}</p>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={addRow}
          className="self-start"
        >
          <Plus className="size-4" aria-hidden />
          Zutat
        </Button>
      </GlassCard>

      <GlassCard className="p-5">
        <Textarea
          label="Zubereitung"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Schritt für Schritt beschreiben …"
          rows={8}
        />
      </GlassCard>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={submitting} fullWidth>
          {recipeId ? "Speichern" : "Rezept anlegen"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
          fullWidth
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
