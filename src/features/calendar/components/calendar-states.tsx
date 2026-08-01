import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`rounded-control bg-neutral-100 ${className}`} />;
}

export function CalendarSkeleton() {
  return (
    <div aria-label="캘린더를 불러오는 중입니다." className="grid gap-6" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <SkeletonBlock className="h-8 w-1/3" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }, (_, index) => (
                <SkeletonBlock className="h-20 w-full" key={index} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-5 w-1/4" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CalendarEmptyState({
  actionHref,
  actionLabel = "일정 등록",
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">{description}</p>
          </div>
          {actionHref ? (
            <LinkButton className="w-full sm:w-fit" href={actionHref} size="sm">
              {actionLabel}
            </LinkButton>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarErrorState({
  onRetry,
  title,
}: {
  onRetry?: () => void;
  title: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">잠시 후 다시 시도해 주세요.</p>
          </div>
          {onRetry ? (
            <Button className="w-full sm:w-fit" onClick={onRetry} size="sm" variant="secondary">
              다시 시도
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
