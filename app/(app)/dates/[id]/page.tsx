import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import { getDate } from "@/lib/data/dates";
import { formatDate, formatWeekday } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stars } from "@/components/dates/Stars";
import { DateDetailActions } from "@/components/dates/DateDetailActions";
import { dateCategoryMeta } from "@/lib/types";

export default async function DateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const date = await getDate(id);
  if (!date) notFound();

  const category = dateCategoryMeta(date.category);
  const shownDate = date.completed_on ?? date.scheduled_for;
  const photos = date.photos.filter((photo) => photo.url);
  const [cover, ...rest] = photos;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-8 pt-4">
      <Link
        href="/dates"
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Alle Dates
      </Link>

      {cover && (
        <div className="relative aspect-video overflow-hidden rounded-3xl">
          <Image
            src={cover.url!}
            alt={date.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rest.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={photo.url!}
                alt={date.title}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {date.emoji ?? "💫"}
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{date.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={date.status === "erledigt" ? "success" : "accent"}>
            {date.status === "erledigt" ? "Erledigt" : "Geplant"}
          </Badge>
          <Badge>
            {category.emoji} {category.label}
          </Badge>
          {date.rating ? <Stars value={date.rating} size={16} /> : null}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-muted">
          {shownDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {formatWeekday(shownDate)}, {formatDate(shownDate)}
            </span>
          )}
          {date.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {date.location}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Avatar
              name={date.created_by_profile.display_name}
              color={date.created_by_profile.accent_color}
              size="sm"
            />
            von {date.created_by_profile.display_name}
          </span>
        </div>
      </div>

      <DateDetailActions date={date} />

      {date.notes && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold">Erinnerungen</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {date.notes}
          </p>
        </GlassCard>
      )}
    </div>
  );
}
