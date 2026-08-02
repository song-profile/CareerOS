import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarErrorState, EventFormSkeleton } from "@/features/calendar/components/calendar-states";
import { LazyEventForm } from "@/features/calendar/components/lazy-event-form";
import { getCalendarApplications } from "@/features/calendar/calendar-service";
import type { CalendarEventType } from "@/features/calendar/types";

interface CalendarNewPageProps {
  searchParams: Promise<{
    date?: string;
    applicationId?: string;
    eventType?: CalendarEventType;
  }>;
}

export default async function CalendarNewPage({ searchParams }: CalendarNewPageProps) {
  const [params, applicationsResult] = await Promise.all([
    searchParams,
    getCalendarApplications(),
  ]);

  return (
    <>
      <PageHeader
        description="지원 건과 연결하거나 개인 준비 일정을 등록합니다."
        title="일정 등록"
      />

      {applicationsResult.ok ? (
        <Suspense fallback={<EventFormSkeleton />}>
          <LazyEventForm applications={applicationsResult.value} mode="create" searchParams={params} />
        </Suspense>
      ) : (
        <CalendarErrorState title="지원 건 목록을 불러올 수 없습니다." />
      )}
    </>
  );
}
