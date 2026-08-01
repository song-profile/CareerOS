import { PageHeader } from "@/components/layout/page-header";
import { VersionCompareSkeleton } from "@/features/essays/components/version-states";

export default function EssayVersionCompareLoading() {
  return (
    <>
      <PageHeader description="두 버전을 나란히 비교합니다." title="버전 비교" />
      <VersionCompareSkeleton />
    </>
  );
}
