import { getDDayLabel as getSharedDDayLabel } from "@/lib/utils/date";
import type { DeadlineTone } from "@/lib/utils/date";

export type ApplicationDeadlineTone = DeadlineTone;

export { addDays, setTime, getDaysUntil, getDeadlineTone } from "@/lib/utils/date";

export function getDDayLabel(daysUntil: number): string {
  return getSharedDDayLabel(daysUntil, "오늘 마감");
}

export function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
