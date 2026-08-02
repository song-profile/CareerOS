"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ApplicationErrorState } from "@/features/applications/components/application-list-states";

export default function ApplicationsError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader
        description="지원 목록 요청 중 오류가 발생했습니다."
        title="지원관리"
      />
      <ApplicationErrorState onRetry={reset} />
    </>
  );
}
