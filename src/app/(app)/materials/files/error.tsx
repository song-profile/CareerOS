"use client";

import { MaterialsErrorState } from "@/features/materials/components/materials-states";

export default function MaterialFilesError({ reset }: { reset: () => void }) {
  return <MaterialsErrorState onRetry={reset} title="파일 목록을 불러올 수 없습니다." />;
}
