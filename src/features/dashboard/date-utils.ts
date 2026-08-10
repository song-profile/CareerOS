import { getDDayLabel as getSharedDDayLabel } from "@/lib/utils/date";
import type { DeadlineTone } from "@/lib/utils/date";

export type { DeadlineTone };

export { addDays, setTime, getDaysUntil, getDeadlineTone } from "@/lib/utils/date";

export function getDDayLabel(daysUntil: number): string {
  return getSharedDDayLabel(daysUntil, "오늘 마감");
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeOpenedAt(date: Date, baseDate: Date = new Date()): string {
  const diffMilliseconds = baseDate.getTime() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMilliseconds / (60 * 60 * 1000)));

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.round(diffHours / 24)}일 전`;
}
