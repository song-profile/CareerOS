import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ErrorStateCard, StateCard } from "@/components/ui/state-card";

/** 저장된 답변 자체가 없는 경우. */
export function EssayLibraryNoDataState() {
  return (
    <StateCard
      actionHref="/applications"
      actionLabel="지원관리로 이동"
      actionVariant="secondary"
      description="지원 건에서 자소서 문항을 먼저 등록하면 이 화면에서 회사와 유형별로 다시 찾을 수 있습니다."
      title="아직 저장한 자소서 답변이 없습니다."
    />
  );
}

/** 데이터는 있지만 현재 필터 조건에 맞는 결과가 없는 경우. */
export function EssayLibraryNoResultState({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">선택한 조건에 맞는 답변이 없습니다.</p>
            <p className="text-body text-neutral-600">
              검색어를 줄이거나 필터를 해제하면 다시 확인할 수 있습니다.
            </p>
          </div>
          <Button className="w-full sm:w-fit" onClick={onReset} size="sm" variant="secondary">
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Suspense fallback으로 사용한다. 가짜 타이머 없이 실제 로딩 구간에서만 보인다. */
export function EssayLibrarySkeleton() {
  return (
    <div aria-label="자소서 목록을 불러오는 중입니다." className="grid gap-6" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <SkeletonBlock className="h-10 w-full" />
            <div className="flex flex-wrap gap-2">
              {["w-20", "w-16", "w-24", "w-16", "w-24"].map((width, index) => (
                <SkeletonBlock className={`h-8 ${width}`} key={`${width}-${index}`} />
              ))}
            </div>
            <SkeletonBlock className="h-8 w-1/3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {["first", "second", "third"].map((key) => (
          <Card key={key}>
            <CardContent>
              <div className="grid gap-3">
                <SkeletonBlock className="h-5 w-1/3" />
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** 서버 내부 오류나 스택은 노출하지 않는다. */
export function EssayLibraryErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorStateCard
      message="잠시 후 다시 시도해 주세요. 문제가 계속되면 네트워크 상태를 확인해 주세요."
      onRetry={onRetry}
      title="자소서 목록을 불러올 수 없습니다."
    />
  );
}
