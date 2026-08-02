import { PageHeader } from "@/components/layout/page-header";
import { CredentialListSkeleton } from "@/features/materials/components/materials-states";

export default function CredentialsLoading() {
  return (
    <>
      <PageHeader description="자격증과 어학 성적을 불러오는 중입니다." title="자격증·어학" />
      <CredentialListSkeleton />
    </>
  );
}
