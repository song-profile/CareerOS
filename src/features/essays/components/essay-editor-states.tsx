import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`rounded-control bg-neutral-100 ${className}`} />;
}

/** 문항 메타데이터와 에디터를 함께 대기시킨다. 빈 Textarea를 먼저 보여주지 않는다. */
export function EssayEditorSkeleton() {
  return (
    <div aria-label="자소서 답변을 불러오는 중입니다." className="grid gap-6" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-4 w-1/4" />
            <SkeletonBlock className="h-6 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-6 w-20" />
              <SkeletonBlock className="h-6 w-16" />
              <SkeletonBlock className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-4 w-1/5" />
            <SkeletonBlock className="h-64 w-full" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** 답변을 불러오지 못한 경우. 서버 내부 오류는 노출하지 않는다. */
export function EssayEditorErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">답변을 불러올 수 없습니다.</p>
            <p className="text-body text-neutral-600">
              잠시 후 다시 시도해 주세요. 작성 중이던 내용은 저장되지 않았을 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-fit" onClick={onRetry} size="sm" variant="secondary">
              다시 시도
            </Button>
            <LinkButton className="w-full sm:w-fit" href="/essays" size="sm" variant="ghost">
              목록으로
            </LinkButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** 존재하지 않는 answerId. */
export function EssayEditorNotFoundState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">답변을 찾을 수 없습니다.</p>
            <p className="text-body text-neutral-600">
              삭제되었거나 주소가 잘못된 답변입니다. 자소서 목록에서 다시 열어 주세요.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton className="w-full sm:w-fit" href="/essays" size="sm">
              자소서 목록으로
            </LinkButton>
            <LinkButton className="w-full sm:w-fit" href="/applications" size="sm" variant="secondary">
              지원관리로
            </LinkButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
