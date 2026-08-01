import type { CalendarEventType, CalendarReminderRule } from "@/features/calendar/types";

export const CALENDAR_EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  APPLICATION_DEADLINE: "지원 마감",
  APTITUDE_TEST: "인적성검사",
  NCS_TEST: "NCS 필기",
  TECHNICAL_TEST: "전공 필기",
  CODING_TEST: "코딩테스트",
  AI_ASSESSMENT: "AI 역량검사",
  ASSIGNMENT: "과제 제출",
  FIRST_INTERVIEW: "1차 면접",
  SECOND_INTERVIEW: "2차 면접",
  FINAL_INTERVIEW: "최종 면접",
  RESULT_ANNOUNCEMENT: "결과 발표 예정",
  PERSONAL_PREPARATION: "개인 준비 일정",
};

export const CALENDAR_EVENT_TYPES = Object.keys(
  CALENDAR_EVENT_TYPE_LABEL,
) as CalendarEventType[];

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const DEFAULT_REMINDER_RULES: CalendarReminderRule[] = [
  { id: "reminder-7-days", minutesBefore: 7 * 24 * 60, enabled: true, channel: "INTERNAL" },
  { id: "reminder-3-days", minutesBefore: 3 * 24 * 60, enabled: true, channel: "INTERNAL" },
  { id: "reminder-1-day", minutesBefore: 24 * 60, enabled: true, channel: "INTERNAL" },
  { id: "reminder-3-hours", minutesBefore: 3 * 60, enabled: true, channel: "INTERNAL" },
];

export const REMINDER_PRESET_OPTIONS = [
  { label: "7일 전 오전 9시", minutesBefore: 7 * 24 * 60 },
  { label: "3일 전 오전 9시", minutesBefore: 3 * 24 * 60 },
  { label: "1일 전 오전 9시", minutesBefore: 24 * 60 },
  { label: "당일 3시간 전", minutesBefore: 3 * 60 },
];
