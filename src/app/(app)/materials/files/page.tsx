import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { LazyMaterialFileList } from "@/features/materials/components/lazy-material-file-list";
import { MaterialFileListSkeleton, MaterialsErrorState } from "@/features/materials/components/materials-states";
import { getMaterialFiles } from "@/features/materials/materials-service";

export default async function MaterialFilesPage() {
  const filesResult = await getMaterialFiles();

  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/materials" size="sm" variant="secondary">
            내 자료 홈
          </LinkButton>
        }
        description="증명사진, 포트폴리오, 증빙 파일을 유형별로 찾아봅니다."
        title="파일 보관함"
      />

      {filesResult.ok ? (
        <Suspense fallback={<MaterialFileListSkeleton />}>
          <LazyMaterialFileList files={filesResult.value} />
        </Suspense>
      ) : (
        <MaterialsErrorState title="파일 목록을 불러올 수 없습니다." />
      )}
    </>
  );
}
