import { PageHeader } from "@/components/layout/page-header";
import { ProfileSkeleton } from "@/features/materials/components/materials-states";

export default function ProfileLoading() {
  return (
    <>
      <PageHeader description="기본정보를 불러오는 중입니다." title="기본정보" />
      <div className="max-w-3xl">
        <ProfileSkeleton />
      </div>
    </>
  );
}
