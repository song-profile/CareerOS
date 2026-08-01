"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EssayEditorErrorState } from "@/features/essays/components/essay-editor-states";

/** 오류 원인은 화면에 노출하지 않고 재시도 경로만 제공한다. */
export default function EssayEditorError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader description="자소서 답변을 표시할 수 없습니다." title="자소서 작성" />
      <EssayEditorErrorState onRetry={reset} />
    </>
  );
}
