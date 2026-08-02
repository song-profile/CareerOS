import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ErrorStateCard, StateCard } from "@/components/ui/state-card";

export function ProfileSkeleton() {
  return (
    <Card aria-label="기본정보를 불러오는 중입니다." role="status">
      <CardContent>
        <div className="grid gap-3">
          <SkeletonBlock className="h-5 w-1/4" />
          {["a", "b", "c", "d"].map((key) => (
            <SkeletonBlock className="h-8 w-full" key={key} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CredentialListSkeleton() {
  return (
    <div aria-label="자격 정보를 불러오는 중입니다." className="grid gap-3" role="status">
      {["a", "b", "c"].map((key) => (
        <Card key={key}>
          <CardContent>
            <div className="grid gap-3">
              <SkeletonBlock className="h-5 w-1/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-8 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CredentialDetailSkeleton() {
  return (
    <div aria-label="자격 상세를 불러오는 중입니다." className="grid gap-4" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-6 w-1/3" />
            <SkeletonBlock className="h-4 w-1/4" />
            {["a", "b", "c", "d", "e"].map((key) => (
              <SkeletonBlock className="h-8 w-full" key={key} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-5 w-1/5" />
            <SkeletonBlock className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MaterialFileListSkeleton() {
  return (
    <div aria-label="파일 목록을 불러오는 중입니다." className="grid gap-3" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-5 w-1/5" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      {["a", "b", "c"].map((key) => (
        <Card key={key}>
          <CardContent>
            <div className="grid gap-3">
              <SkeletonBlock className="h-5 w-2/5" />
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-8 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExternalLinkListSkeleton() {
  return (
    <div aria-label="외부 링크를 불러오는 중입니다." className="grid gap-4" role="status">
      <Card>
        <CardContent>
          <div className="grid gap-3">
            <SkeletonBlock className="h-5 w-1/5" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["a", "b", "c"].map((key) => (
          <Card key={key}>
            <CardContent>
              <div className="grid gap-3">
                <SkeletonBlock className="h-9 w-9" />
                <SkeletonBlock className="h-5 w-2/3" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface MaterialsEmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function MaterialsEmptyState({
  actionHref,
  actionLabel,
  description,
  onAction,
  title,
}: MaterialsEmptyStateProps) {
  return (
    <StateCard
      actionHref={actionHref}
      actionLabel={actionLabel}
      description={description}
      onAction={onAction}
      title={title}
    />
  );
}

interface MaterialsErrorStateProps {
  title: string;
  onRetry?: () => void;
}

/** 서버 메시지와 민감한 값은 노출하지 않는다. */
export function MaterialsErrorState({ onRetry, title }: MaterialsErrorStateProps) {
  return <ErrorStateCard onRetry={onRetry} title={title} />;
}

export function CredentialNotFoundState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">자격 정보를 찾을 수 없습니다.</p>
            <p className="text-body text-neutral-600">
              삭제되었거나 주소가 잘못되었습니다. 목록에서 다시 열어 주세요.
            </p>
          </div>
          <LinkButton className="w-full sm:w-fit" href="/materials/credentials" size="sm">
            자격증·어학 목록으로
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
