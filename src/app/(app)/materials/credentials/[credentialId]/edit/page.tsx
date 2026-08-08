import { PageHeader } from "@/components/layout/page-header";
import {
  getCredentialForCurrentUser,
  getCredentialNumberForCurrentUser,
} from "@/features/materials/api/server-materials-api";
import { CredentialForm } from "@/features/materials/components/credential-form";
import { CredentialNotFoundState } from "@/features/materials/components/materials-states";
import { toCredentialFormValues } from "@/features/materials/form-defaults";

interface EditCredentialPageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function EditCredentialPage({ params }: EditCredentialPageProps) {
  const { credentialId } = await params;
  const result = await getCredentialForCurrentUser(credentialId);

  if (!result.ok) {
    return (
      <>
        <PageHeader description="요청한 자격 정보가 없습니다." title="자격 수정" />
        <CredentialNotFoundState />
      </>
    );
  }

  const initialValues = toCredentialFormValues(result.value);

  if (result.value.hasCredentialNumber) {
    const numberResult = await getCredentialNumberForCurrentUser(credentialId);

    if (numberResult.ok) {
      initialValues.credentialNumber = numberResult.value;
    }
  }

  return (
    <>
      <PageHeader description={result.value.name} title="자격 수정" />
      <CredentialForm
        credentialId={credentialId}
        initialValues={initialValues}
        mode="edit"
      />
    </>
  );
}
