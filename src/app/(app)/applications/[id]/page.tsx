import { PageHeader } from "@/components/layout/page-header";
import {
  ApplicationDetailEmptyState,
  ApplicationDetailView,
} from "@/features/applications/components/application-detail";
import { fetchApplicationForCurrentUser } from "@/features/applications/api/server-application-api";

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  const applicationResult = await fetchApplicationForCurrentUser(id);

  if (!applicationResult.ok) {
    return (
      <>
        <PageHeader
          description={applicationResult.message}
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
      <ApplicationDetailView application={applicationResult.value} />
    </>
  );
}
