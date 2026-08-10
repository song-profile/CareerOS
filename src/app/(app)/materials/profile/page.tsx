import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { getUserProfileForCurrentUser } from "@/features/materials/api/server-materials-api";
import {
  MaterialsErrorState,
} from "@/features/materials/components/materials-states";
import { ProfileForm } from "@/features/materials/components/profile-form";

export default async function ProfilePage() {
  const result = await getUserProfileForCurrentUser();

  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/materials" size="sm" variant="secondary">
            내 취업자료로
          </LinkButton>
        }
        description="지원서에 반복해서 넣는 값입니다. 각 항목 옆 복사 버튼으로 바로 가져다 쓸 수 있습니다."
        title="기본정보"
      />
      <div className="max-w-3xl">
        {result.ok ? (
          <ProfileForm profile={result.value} />
        ) : (
          <MaterialsErrorState title="기본정보를 불러올 수 없습니다." />
        )}
      </div>
    </>
  );
}
