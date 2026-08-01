import { PageHeader } from "@/components/layout/page-header";
import { CredentialForm } from "@/features/materials/components/credential-form";
import { CredentialNotFoundState } from "@/features/materials/components/materials-states";
import { toCredentialFormValues } from "@/features/materials/form-defaults";
import { getCredential } from "@/features/materials/materials-service";

interface EditCredentialPageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function EditCredentialPage({ params }: EditCredentialPageProps) {
  const { credentialId } = await params;
  const result = await getCredential(credentialId);

  if (!result.ok) {
    return (
      <>
        <PageHeader description="요청한 자격 정보가 없습니다." title="자격 수정" />
        <CredentialNotFoundState />
      </>
    );
  }

  return (
    <>
      <PageHeader description={result.value.name} title="자격 수정" />
      <CredentialForm
        credentialId={credentialId}
        initialValues={toCredentialFormValues(result.value)}
        mode="edit"
      />
    </>
  );
}
