"use client";

import { MaterialsErrorState } from "@/features/materials/components/materials-states";

export default function MaterialLinksError({ reset }: { reset: () => void }) {
  return <MaterialsErrorState onRetry={reset} title="외부 링크를 불러올 수 없습니다." />;
}
