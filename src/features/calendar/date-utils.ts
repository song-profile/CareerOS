import type { CalendarEvent } from "@/features/calendar/types";
import { getDaysUntil, getDDayLabel as getSharedDDayLabel } from "@/lib/utils/date";

export { getDaysUntil } from "@/lib/utils/date";

const MONTH_GRID_DAYS = 42;

export interface CalendarMonthDay {
  date: Date;
  key: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date | null {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return toDateKey(date) === dateKey ? date : null;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function getCalendarGridRange(monthDate: Date): { start: Date; end: Date } {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - monthStart.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + MONTH_GRID_DAYS - 1);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function buildCalendarMonthDays(monthDate: Date, today: Date): CalendarMonthDay[] {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const todayKey = toDateKey(today);

  return Array.from({ length: MONTH_GRID_DAYS }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: toDateKey(date) === todayKey,
    };
  });
}

export function isSameDate(left: Date, right: Date): boolean {
  return toDateKey(left) === toDateKey(right);
}

export function getDDayLabel(date: Date, baseDate: Date = new Date()): string {
  return getSharedDDayLabel(getDaysUntil(date, baseDate));
}

export function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function formatEventDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events
    .filter((event) => isSameDate(event.startAt, date))
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
}

export function getUpcomingEvents(
  events: CalendarEvent[],
  baseDate: Date = new Date(),
): CalendarEvent[] {
  const base = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0,
    0,
  );

  return events
    .filter((event) => event.endAt.getTime() >= base.getTime())
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
}
