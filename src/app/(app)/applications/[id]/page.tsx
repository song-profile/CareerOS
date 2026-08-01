import { PageHeader } from "@/components/layout/page-header";
import {
  ApplicationDetailEmptyState,
  ApplicationDetailView,
} from "@/features/applications/components/application-detail";
import { applicationDetailMockData } from "@/features/applications/detail-mock-data";

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  const application = applicationDetailMockData.find((item) => item.id === id);

  if (!application) {
    return (
      <>
        <PageHeader
          description="지원 상세 정보를 표시할 수 없습니다."
          title="지원 상세"
        />
        <ApplicationDetailEmptyState />
      </>
    );
  }

  return (
    <>
      <PageHeader
        description="지원 준비 상태와 제출 자료를 한 화면에서 확인합니다."
        title="지원 상세"
      />
      <ApplicationDetailView application={application} />
    </>
  );
}
