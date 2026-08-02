import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarEmptyState, CalendarErrorState, EventFormSkeleton } from "@/features/calendar/components/calendar-states";
import { LazyEventForm } from "@/features/calendar/components/lazy-event-form";
import {
  getCalendarApplications,
  getCalendarEvent,
} from "@/features/calendar/calendar-service";

interface CalendarEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CalendarEditPage({ params }: CalendarEditPageProps) {
  const { id } = await params;
  const [eventResult, applicationsResult] = await Promise.all([
    getCalendarEvent(id),
    getCalendarApplications(),
  ]);

  if (!eventResult.ok) {
    return (
      <>
        <PageHeader description="수정할 일정을 표시할 수 없습니다." title="일정 수정" />
        <CalendarEmptyState
          actionHref="/calendar"
          actionLabel="캘린더로"
          description="삭제되었거나 잘못된 일정 주소입니다."
          title="일정을 찾을 수 없습니다."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader description="일정 정보를 수정합니다. 실제 API 저장은 아직 연결하지 않습니다." title="일정 수정" />
      {applicationsResult.ok ? (
        <Suspense fallback={<EventFormSkeleton />}>
          <LazyEventForm
            applications={applicationsResult.value}
            event={eventResult.value}
            mode="edit"
          />
        </Suspense>
      ) : (
        <CalendarErrorState title="지원 건 목록을 불러올 수 없습니다." />
      )}
    </>
  );
}
