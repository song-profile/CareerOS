import { PageHeader } from "@/components/layout/page-header";
import { ApplicationLoadingState } from "@/features/applications/components/application-list-states";

export default function ApplicationsLoading() {
  return (
    <>
      <PageHeader
        description="회사와 직무별 지원 건을 검색하고 상태와 마감순으로 빠르게 확인하세요."
        title="지원관리"
      />
      <ApplicationLoadingState />
    </>
  );
}
