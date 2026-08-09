"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MaterialsErrorState } from "@/features/materials/components/materials-states";

export default function CredentialsError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader description="자격 정보를 표시할 수 없습니다." title="자격증·어학" />
      <MaterialsErrorState onRetry={reset} title="자격 정보를 불러올 수 없습니다." />
    </>
  );
}
