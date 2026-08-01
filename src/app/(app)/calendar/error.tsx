"use client";

import { CalendarErrorState } from "@/features/calendar/components/calendar-states";

export default function CalendarError({ reset }: { reset: () => void }) {
  return <CalendarErrorState onRetry={reset} title="일정 목록을 불러올 수 없습니다." />;
}
