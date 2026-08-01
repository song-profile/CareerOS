import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { DeadlineCard } from "@/features/dashboard/components/deadline-card";
import {
  DashboardEmptyState,
  DashboardSection,
} from "@/features/dashboard/components/dashboard-section";
import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { ExpiringCredentials } from "@/features/dashboard/components/expiring-credentials";
import { RecentResources } from "@/features/dashboard/components/recent-resources";
import { UpcomingEvents } from "@/features/dashboard/components/upcoming-events";
import { dashboardMockData } from "@/features/dashboard/mock-data";

export default function DashboardPage() {
  const dashboardData = dashboardMockData;

  return (
    <>
      <PageHeader
        actions={
          <>
            <LinkButton href="/applications" variant="secondary">
              지원 목록
            </LinkButton>
            <LinkButton href="/applications/new">지원 등록</LinkButton>
          </>
        }
        description="마감, 일정, 작성 중인 지원서를 빠르게 확인하세요."
        title="대시보드"
      />

      <DashboardSummary summary={dashboardData.summary} />

      <DashboardSection
        description="마감이 가까운 지원 건부터 확인하고 미완료 항목을 처리하세요."
        title="임박한 지원 마감"
      >
        {dashboardData.upcomingDeadlines.length === 0 ? (
          <DashboardEmptyState
            description="새 지원 건을 등록하면 마감이 가까운 순서로 보여드립니다."
            title="이번 주는 예정된 마감이 없습니다."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {dashboardData.upcomingDeadlines.map((deadline) => (
              <DeadlineCard deadline={deadline} key={deadline.applicationId} />
            ))}
          </div>
        )}
      </DashboardSection>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <UpcomingEvents events={dashboardData.recruitmentEvents} />
        <ExpiringCredentials credentials={dashboardData.expiringCredentials} />
      </div>

      <RecentResources resources={dashboardData.recentResources} />
    </>
  );
}
