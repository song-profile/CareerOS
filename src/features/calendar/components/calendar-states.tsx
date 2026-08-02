import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ErrorStateCard, StateCard } from "@/components/ui/state-card";

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

export function EventFormSkeleton() {
  return (
    <div aria-label="일정 입력 폼을 불러오는 중입니다." className="grid gap-6" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-24 w-full md:col-span-2" />
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
    <StateCard
      actionHref={actionHref}
      actionLabel={actionHref ? actionLabel : undefined}
      description={description}
      title={title}
    />
  );
}

export function CalendarErrorState({
  onRetry,
  title,
}: {
  onRetry?: () => void;
  title: string;
}) {
  return <ErrorStateCard onRetry={onRetry} title={title} />;
}
