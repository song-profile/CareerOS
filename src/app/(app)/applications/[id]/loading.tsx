import { PageHeader } from "@/components/layout/page-header";
import { ApplicationDetailLoadingState } from "@/features/applications/components/application-detail";

export default function ApplicationDetailLoading() {
  return (
    <>
      <PageHeader
        description="지원 상세 정보를 불러오는 중입니다."
        title="지원 상세"
      />
      <ApplicationDetailLoadingState />
    </>
  );
}
