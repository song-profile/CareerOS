import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { DeadlineCard } from "@/features/dashboard/components/deadline-card";
import {
  DashboardErrorState,
  DashboardEmptyState,
  DashboardSection,
} from "@/features/dashboard/components/dashboard-section";
import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { UpcomingEvents } from "@/features/dashboard/components/upcoming-events";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
import { getDashboardSummary } from "@/features/dashboard/dashboard-service";
import type { DashboardData } from "@/features/dashboard/types";

export default async function DashboardPage() {
  const [authState, dashboardResult] = await Promise.all([
    getCurrentUserFromSession(),
    getDashboardSummary(),
  ]);
  const currentUserName = authState.status === "authenticated" ? authState.user.name : "사용자";

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
        description={`${currentUserName}님, 마감, 일정, 작성 중인 지원서를 빠르게 확인하세요.`}
        title="대시보드"
      />

      {dashboardResult.ok ? (
        <DashboardContent dashboardData={dashboardResult.value} />
      ) : (
        <DashboardErrorState
          description={dashboardResult.message}
          title="대시보드를 불러올 수 없습니다."
        />
      )}
    </>
  );
}

function DashboardContent({ dashboardData }: { dashboardData: DashboardData }) {
  return (
    <>
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

      <UpcomingEvents events={dashboardData.upcomingEvents} />
    </>
  );
}
