import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardEmptyState, DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { formatDateTime } from "@/features/dashboard/date-utils";
import type { RecruitmentEvent } from "@/features/dashboard/types";

interface UpcomingEventsProps {
  events: RecruitmentEvent[];
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
                      <Badge variant="primary">{event.type}</Badge>
                      <p className="text-body-medium text-neutral-900">{event.companyName}</p>
                    </div>
                    <p className="text-body text-neutral-600">{event.roleName}</p>
                    <p className="text-caption text-neutral-600">{event.location}</p>
                  </div>
                  <p className="font-mono text-mono text-neutral-900">{formatDateTime(event.startsAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
