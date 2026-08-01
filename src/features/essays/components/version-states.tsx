import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`rounded-control bg-neutral-100 ${className}`} />;
}

export function VersionPanelSkeleton() {
  return (
    <Card aria-label="버전 이력을 불러오는 중입니다." role="status">
      <CardContent>
        <div className="grid gap-3">
          <SkeletonBlock className="h-5 w-1/3" />
          {["first", "second", "third"].map((key) => (
            <SkeletonBlock className="h-20 w-full" key={key} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TagEditorSkeleton() {
  return (
    <Card aria-label="태그 목록을 불러오는 중입니다." role="status">
      <CardContent>
        <div className="grid gap-3">
          <SkeletonBlock className="h-5 w-1/4" />
          <SkeletonBlock className="h-10 w-full" />
          <div className="flex flex-wrap gap-2">
            {["w-16", "w-24", "w-20", "w-16"].map((width, index) => (
              <SkeletonBlock className={`h-8 ${width}`} key={`${width}-${index}`} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** 비교 화면 양쪽 패널 Skeleton. */
export function VersionCompareSkeleton() {
  return (
    <div
      aria-label="비교할 버전을 불러오는 중입니다."
      className="grid gap-4 lg:grid-cols-2"
      role="status"
    >
      {["left", "right"].map((side) => (
        <Card key={side}>
          <CardContent>
            <div className="grid gap-3">
              <SkeletonBlock className="h-5 w-1/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function VersionPanelErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">버전 이력을 불러올 수 없습니다.</p>
            <p className="text-body text-neutral-600">
              잠시 후 다시 시도해 주세요. 작성 중인 내용은 그대로 유지됩니다.
            </p>
          </div>
          <Button className="w-full sm:w-fit" onClick={onRetry} size="sm" variant="secondary">
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function VersionCompareErrorState({ answerGroupId }: { answerGroupId: string }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">비교할 버전을 불러올 수 없습니다.</p>
            <p className="text-body text-neutral-600">
              선택한 버전이 없거나 서로 같은 버전입니다. 에디터에서 버전을 다시 선택해 주세요.
            </p>
          </div>
          <LinkButton className="w-full sm:w-fit" href={`/essays/${answerGroupId}`} size="sm">
            에디터로 돌아가기
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

/** 비교할 다른 버전이 없는 경우. */
export function VersionCompareEmptyState({ answerGroupId }: { answerGroupId: string }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">비교할 다른 버전이 없습니다.</p>
            <p className="text-body text-neutral-600">
              이 답변에는 버전이 하나뿐입니다. 새 버전을 만들면 두 버전을 나란히 비교할 수 있습니다.
            </p>
          </div>
          <LinkButton className="w-full sm:w-fit" href={`/essays/${answerGroupId}`} size="sm">
            에디터로 돌아가기
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
