"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CalendarErrorState } from "@/features/calendar/components/calendar-states";

export default function CalendarDetailError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader description="일정 상세를 표시할 수 없습니다." title="일정 상세" />
      <CalendarErrorState onRetry={reset} title="일정 상세를 불러올 수 없습니다." />
    </>
  );
}
