import { PageHeader } from "@/components/layout/page-header";
import { CredentialDetailSkeleton } from "@/features/materials/components/materials-states";

export default function CredentialDetailLoading() {
  return (
    <>
      <PageHeader description="자격 상세 정보를 불러오는 중입니다." title="자격 상세" />
      <CredentialDetailSkeleton />
    </>
  );
}
