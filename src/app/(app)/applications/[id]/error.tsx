"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ApplicationDetailErrorState } from "@/features/applications/components/application-detail";

export default function ApplicationDetailError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader
        description="지원 상세 요청 중 오류가 발생했습니다."
        title="지원 상세"
      />
      <ApplicationDetailErrorState onRetry={reset} />
    </>
  );
}
