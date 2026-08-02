import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { LazyExternalLinkManager } from "@/features/materials/components/lazy-external-link-manager";
import { ExternalLinkListSkeleton, MaterialsErrorState } from "@/features/materials/components/materials-states";
import { getExternalLinks } from "@/features/materials/materials-service";

export default async function MaterialLinksPage() {
  const linksResult = await getExternalLinks();

  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/materials" size="sm" variant="secondary">
            내 자료 홈
          </LinkButton>
        }
        description="GitHub, Notion, 블로그, 포트폴리오 등 지원서에 자주 넣는 링크를 관리합니다."
        title="외부 링크 관리"
      />

      {linksResult.ok ? (
        <Suspense fallback={<ExternalLinkListSkeleton />}>
          <LazyExternalLinkManager links={linksResult.value} />
        </Suspense>
      ) : (
        <MaterialsErrorState title="외부 링크를 불러올 수 없습니다." />
      )}
    </>
  );
}
