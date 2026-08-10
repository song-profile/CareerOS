const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type DeadlineTone = "urgent" | "soon" | "week" | "calm" | "ended";

export function addDays(baseDate: Date, days: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + days);
  return nextDate;
}

export function setTime(date: Date, hours: number, minutes: number): Date {
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
}

export function getDaysUntil(targetDate: Date, baseDate: Date = new Date()): number {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return Math.ceil((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY);
}

export function getDeadlineTone(daysUntil: number): DeadlineTone {
  if (daysUntil < 0) {
    return "ended";
  }

  if (daysUntil <= 1) {
    return "urgent";
  }

  if (daysUntil <= 3) {
    return "soon";
  }

  if (daysUntil <= 7) {
    return "week";
  }

  return "calm";
}

export function getDDayLabel(daysUntil: number, todayLabel = "오늘"): string {
  if (daysUntil < 0) {
    return "종료";
  }

  if (daysUntil === 0) {
    return todayLabel;
  }

  return `D-${daysUntil}`;
}
