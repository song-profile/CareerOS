import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { ApplicationList } from "@/features/applications/components/application-list";
import { applicationMockData } from "@/features/applications/mock-data";

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        actions={<LinkButton href="/applications/new">지원 등록</LinkButton>}
        description="회사와 직무별 지원 건을 검색하고 상태와 마감순으로 빠르게 확인하세요."
        title="지원관리"
      />
      <ApplicationList applications={applicationMockData} />
    </>
  );
}
