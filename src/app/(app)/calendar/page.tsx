import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { CalendarErrorState, CalendarSkeleton } from "@/features/calendar/components/calendar-states";
import { LazyCalendarBoard } from "@/features/calendar/components/lazy-calendar-board";
import {
  getCalendarEvents,
  getUpcomingCalendarEvents,
} from "@/features/calendar/calendar-service";
import { getCalendarGridRange } from "@/features/calendar/date-utils";

interface CalendarPageProps {
  searchParams: Promise<{
    applicationId?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const applicationId = toOptionalNumber(params.applicationId);
  const initialMonth = new Date();
  const initialRange = getCalendarGridRange(initialMonth);
  const [eventsResult, upcomingResult] = await Promise.all([
    getCalendarEvents({
      start: initialRange.start.toISOString(),
      end: initialRange.end.toISOString(),
      applicationId,
    }),
    applicationId ? getCalendarEvents({ upcoming: true, limit: 8, applicationId }) : getUpcomingCalendarEvents(8),
  ]);

  return (
    <>
      <PageHeader
        actions={
          <>
            <LinkButton href="/settings/calendar" variant="secondary">
              Google Calendar
            </LinkButton>
            <LinkButton href="/calendar/new">일정 등록</LinkButton>
          </>
        }
        description="지원 마감, 코딩테스트, 필기, 면접 일정을 월간 캘린더로 확인합니다."
        title="캘린더"
      />

      {eventsResult.ok ? (
        <Suspense fallback={<CalendarSkeleton />}>
          <LazyCalendarBoard
            events={eventsResult.value}
            applicationId={params.applicationId}
            initialMonth={initialMonth.toISOString()}
            upcomingEvents={upcomingResult.ok ? upcomingResult.value : []}
          />
        </Suspense>
      ) : (
        <CalendarErrorState title="일정 목록을 불러올 수 없습니다." />
      )}
    </>
  );
}

function toOptionalNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
