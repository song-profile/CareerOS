import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { EssayLibrary } from "@/features/essays/components/essay-library";
import { EssayLibraryErrorState } from "@/features/essays/components/essay-library-states";
import { fetchEssayLibraryForCurrentUser } from "@/features/essays/api/server-essay-api";
import { parseEssayFilters, toEssayQueryDto } from "@/features/essays/search-params";

/**
 * 필터 상태를 URL에서 읽으므로 요청 시점에 렌더링한다.
 * 정적 프리렌더로 두면 필터가 걸린 링크에서 전체 목록이 잠깐 보였다가 바뀐다.
 */
export const dynamic = "force-dynamic";

interface EssaysPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EssaysPage({ searchParams }: EssaysPageProps) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      if (item) {
        urlSearchParams.append(key, item);
      }
    });
  });

  const filters = parseEssayFilters(urlSearchParams);
  const essaysResult = await fetchEssayLibraryForCurrentUser(toEssayQueryDto(filters));

  return (
    <>
      <PageHeader
        actions={
          <LinkButton href="/applications" size="sm" variant="secondary">
            지원 건에서 문항 등록
          </LinkButton>
        }
        description="회사, 직무, 공통 질문 유형, 경험 소재로 과거 답변을 찾고 제출본을 다시 확인하세요."
        title="자소서 라이브러리"
      />
      {essaysResult.ok ? (
        <EssayLibrary items={essaysResult.value} />
      ) : (
        <EssayLibraryErrorState />
      )}
    </>
  );
}
