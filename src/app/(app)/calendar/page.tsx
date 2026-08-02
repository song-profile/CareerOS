import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { CalendarErrorState, CalendarSkeleton } from "@/features/calendar/components/calendar-states";
import { LazyCalendarBoard } from "@/features/calendar/components/lazy-calendar-board";
import { getCalendarEvents } from "@/features/calendar/calendar-service";

export default async function CalendarPage() {
  const eventsResult = await getCalendarEvents();

  return (
    <>
      <PageHeader
        actions={<LinkButton href="/calendar/new">일정 등록</LinkButton>}
        description="지원 마감, 코딩테스트, 필기, 면접 일정을 월간 캘린더로 확인합니다."
        title="캘린더"
      />

      {eventsResult.ok ? (
        <Suspense fallback={<CalendarSkeleton />}>
          <LazyCalendarBoard events={eventsResult.value} />
        </Suspense>
      ) : (
        <CalendarErrorState title="일정 목록을 불러올 수 없습니다." />
      )}
    </>
  );
}
