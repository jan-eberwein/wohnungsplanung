const euroFormat = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
});

export function formatEuro(amount: number): string {
  return euroFormat.format(amount);
}

const dateFormat = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Heute";
  if (isSameDay(date, yesterday)) return "Gestern";
  return dateFormat.format(date);
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const weekdayFormat = new Intl.DateTimeFormat("de-AT", { weekday: "long" });

export function formatWeekday(iso: string): string {
  return weekdayFormat.format(new Date(iso));
}

/** "500 g", "2 Stk." oder "2" – ohne unnötige Nachkommastellen */
export function formatQuantity(
  quantity: number | null,
  unit: string | null
): string {
  if (quantity === null) return unit ?? "";
  const num = Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toLocaleString("de-AT", { maximumFractionDigits: 2 });
  return unit ? `${num} ${unit}` : num;
}

/** Datum als YYYY-MM-DD in lokaler Zeit (für date-Spalten) */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Montag der Woche, in der das Datum liegt */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // Mo = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}
