import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { getCredentialsForCurrentUser } from "@/features/materials/api/server-materials-api";
import { CredentialList } from "@/features/materials/components/credential-list";
import { MaterialsErrorState } from "@/features/materials/components/materials-states";

export default async function CredentialsPage() {
  const result = await getCredentialsForCurrentUser();

  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/materials/credentials/new" size="sm">
            자격 등록
          </LinkButton>
        }
        description="자격증과 어학 성적을 검색하고 만료 상태를 확인하세요."
        title="자격증·어학"
      />
      {result.ok ? (
        <CredentialList credentials={result.value} />
      ) : (
        <MaterialsErrorState title="자격 정보를 불러올 수 없습니다." />
      )}
    </>
  );
}
