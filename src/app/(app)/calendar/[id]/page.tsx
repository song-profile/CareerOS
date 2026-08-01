import { PageHeader } from "@/components/layout/page-header";
import { CalendarEmptyState } from "@/features/calendar/components/calendar-states";
import { EventDetail } from "@/features/calendar/components/event-detail";
import { getCalendarEvent } from "@/features/calendar/calendar-service";

interface CalendarDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CalendarDetailPage({ params }: CalendarDetailPageProps) {
  const { id } = await params;
  const eventResult = await getCalendarEvent(id);

  if (!eventResult.ok) {
    return (
      <>
        <PageHeader description="일정 상세 정보를 표시할 수 없습니다." title="일정 상세" />
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
      <PageHeader description="일정 상세와 연결된 지원 건 정보를 확인합니다." title="일정 상세" />
      <EventDetail event={eventResult.value} />
    </>
  );
}
