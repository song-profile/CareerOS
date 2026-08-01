import { PageHeader } from "@/components/layout/page-header";
import { CredentialForm } from "@/features/materials/components/credential-form";

export default function NewCredentialPage() {
  return (
    <>
      <PageHeader
        description="자격명과 자격 구분만 있으면 등록할 수 있습니다. 나머지는 나중에 채워도 됩니다."
        title="자격 등록"
      />
      <CredentialForm mode="create" />
    </>
  );
}
