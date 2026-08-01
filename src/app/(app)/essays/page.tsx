import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { EssayLibrary } from "@/features/essays/components/essay-library";
import { EssayLibrarySkeleton } from "@/features/essays/components/essay-library-states";
import { essayLibraryMockData } from "@/features/essays/mock-data";

/**
 * 필터 상태를 URL에서 읽으므로 요청 시점에 렌더링한다.
 * 정적 프리렌더로 두면 필터가 걸린 링크에서 전체 목록이 잠깐 보였다가 바뀐다.
 */
export const dynamic = "force-dynamic";

export default function EssaysPage() {
  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/applications" size="sm" variant="secondary">
            지원 건에서 문항 등록
          </LinkButton>
        }
        description="회사, 직무, 공통 질문 유형, 경험 소재로 과거 답변을 찾고 제출본을 다시 확인하세요."
        title="자소서 라이브러리"
      />
      <Suspense fallback={<EssayLibrarySkeleton />}>
        <EssayLibrary items={essayLibraryMockData} />
      </Suspense>
    </>
  );
}
