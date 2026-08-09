import { PageHeader } from "@/components/layout/page-header";
import { DashboardSkeletonCard } from "@/features/dashboard/components/dashboard-section";

export default function DashboardLoading() {
  return (
    <>
      <PageHeader
        description="마감, 일정, 작성 중인 지원서를 불러오는 중입니다."
        title="대시보드"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["summary-a", "summary-b", "summary-c", "summary-d"].map((key) => (
          <DashboardSkeletonCard key={key} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {["deadline-a", "deadline-b", "deadline-c"].map((key) => (
          <DashboardSkeletonCard key={key} />
        ))}
      </div>
    </>
  );
}
