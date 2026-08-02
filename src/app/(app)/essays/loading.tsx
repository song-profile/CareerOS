import { PageHeader } from "@/components/layout/page-header";
import { EssayLibrarySkeleton } from "@/features/essays/components/essay-library-states";

export default function EssaysLoading() {
  return (
    <>
      <PageHeader
        description="회사, 직무, 공통 질문 유형, 경험 소재로 과거 답변을 찾고 제출본을 다시 확인하세요."
        title="자소서 라이브러리"
      />
      <EssayLibrarySkeleton />
    </>
  );
}
