"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MaterialsErrorState } from "@/features/materials/components/materials-states";

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeader description="기본정보를 표시할 수 없습니다." title="기본정보" />
      <div className="max-w-3xl">
        <MaterialsErrorState onRetry={reset} title="기본정보를 불러올 수 없습니다." />
      </div>
    </>
  );
}
