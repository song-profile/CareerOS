import { PageHeader } from "@/components/layout/page-header";
import { EventDetailSkeleton } from "@/features/calendar/components/calendar-states";

export default function CalendarDetailLoading() {
  return (
    <>
      <PageHeader description="일정 상세 정보를 불러오는 중입니다." title="일정 상세" />
      <EventDetailSkeleton />
    </>
  );
}
