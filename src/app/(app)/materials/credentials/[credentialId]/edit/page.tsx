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

  // PATCH는 전체 교체다. 폼에 마스킹 값을 채우면 저장 시 원본을 덮어쓰므로,
  // 수정 화면에서만 평문을 따로 받아 채운다. 이 조회는 서버에 접근 기록이 남는다.
  // 번호가 없는 자격은 서버가 404로 답하므로 아예 호출하지 않는다.
  const numberResult = result.value.hasCredentialNumber
    ? await getCredentialNumberForCurrentUser(credentialId)
    : null;

  return (
    <>
      <PageHeader description={result.value.name} title="자격 수정" />
      {numberResult && !numberResult.ok ? (
        <p
          className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700"
          role="status"
        >
          {numberResult.message} 이대로 저장하면 등록된 자격번호가 지워집니다.
        </p>
      ) : null}
      <CredentialForm
        credentialId={credentialId}
        initialValues={toCredentialFormValues(
          result.value,
          numberResult?.ok ? numberResult.value : "",
        )}
        mode="edit"
      />
    </>
  );
}
