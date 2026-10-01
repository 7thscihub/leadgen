import { FollowUpState } from "@/types/lead";

const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;

export function todayNairobi(): string {
  return new Date(Date.now() + NAIROBI_OFFSET_MS).toISOString().slice(0, 10);
}

export function followUpState(date: string): FollowUpState {
  const today = todayNairobi();
  if (date < today) return "overdue";
  if (date === today) return "due_today";
  return "upcoming";
}

export function formatNairobiDate(value?: string) {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+03:00`) : new Date(value);
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeZone: "Africa/Nairobi" }).format(date);
}
