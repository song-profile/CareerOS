import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DashboardEmptyState, DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { formatDateTime } from "@/features/dashboard/date-utils";
import type { DashboardUpcomingEvent } from "@/features/dashboard/types";

interface UpcomingEventsProps {
  events: DashboardUpcomingEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <DashboardSection
      description="14일 이내 확인해야 할 코딩테스트, 필기, 면접 일정을 정리했습니다."
      title="다가오는 전형 일정"
    >
      {events.length === 0 ? (
        <DashboardEmptyState
          description="새 일정이 생기면 지원 건과 연결해 한곳에서 확인할 수 있습니다."
          title="다가오는 전형 일정이 없습니다."
        />
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{event.typeLabel}</Badge>
                      <p className="text-body-medium text-neutral-900">
                        {event.companyName || "개인 일정"}
                      </p>
                    </div>
                    <p className="text-body text-neutral-600">
                      {event.roleName || "연결된 지원 건 없음"}
                    </p>
                    <p className="text-caption text-neutral-600">
                      {event.location || "장소 미입력"}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:justify-items-end">
                    <p className="font-mono text-mono text-neutral-900">
                      {event.allDay ? "종일" : formatDateTime(event.startsAt)}
                    </p>
                    <LinkButton href={event.detailHref} size="sm" variant="secondary">
                      일정 상세
                    </LinkButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
