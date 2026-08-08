import { PageHeader } from "@/components/layout/page-header";
import { getCredentialForCurrentUser } from "@/features/materials/api/server-materials-api";
import { CredentialDetailView } from "@/features/materials/components/credential-detail";
import { CredentialNotFoundState } from "@/features/materials/components/materials-states";

interface CredentialDetailPageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function CredentialDetailPage({ params }: CredentialDetailPageProps) {
  const { credentialId } = await params;
  const result = await getCredentialForCurrentUser(credentialId);

  if (!result.ok) {
    return (
      <>
        <PageHeader description="요청한 자격 정보가 없습니다." title="자격 상세" />
        <CredentialNotFoundState />
      </>
    );
  }

  return (
    <>
      <PageHeader
        description="자격번호는 기본으로 가려져 있고, 필요할 때만 확인하고 복사할 수 있습니다."
        title="자격 상세"
      />
      <CredentialDetailView credential={result.value} />
    </>
  );
}
