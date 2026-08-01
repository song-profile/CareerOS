"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EssayLibraryErrorState } from "@/features/essays/components/essay-library-states";

/** 오류 원인은 화면에 노출하지 않고 재시도 경로만 제공한다. */
export default function EssaysError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader
        description="회사, 직무, 공통 질문 유형, 경험 소재로 과거 답변을 찾고 제출본을 다시 확인하세요."
        title="자소서 라이브러리"
      />
      <EssayLibraryErrorState onRetry={reset} />
    </>
  );
}
