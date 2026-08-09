"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardErrorState } from "@/features/dashboard/components/dashboard-section";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader description="대시보드를 표시할 수 없습니다." title="대시보드" />
      <DashboardErrorState
        description="잠시 후 다시 시도해 주세요."
        onRetry={reset}
        title="대시보드를 불러올 수 없습니다."
      />
    </>
  );
}
