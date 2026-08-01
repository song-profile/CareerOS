import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`rounded-control bg-neutral-100 ${className}`} />;
}

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
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">{description}</p>
          </div>
          {actionHref && actionLabel ? (
            <LinkButton className="w-full sm:w-fit" href={actionHref} size="sm">
              {actionLabel}
            </LinkButton>
          ) : null}
          {onAction && actionLabel && !actionHref ? (
            <Button className="w-full sm:w-fit" onClick={onAction} size="sm" variant="secondary">
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface MaterialsErrorStateProps {
  title: string;
  onRetry?: () => void;
}

/** 서버 메시지와 민감한 값은 노출하지 않는다. */
export function MaterialsErrorState({ onRetry, title }: MaterialsErrorStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">잠시 후 다시 시도해 주세요.</p>
          </div>
          <Button className="w-full sm:w-fit" onClick={onRetry} size="sm" variant="secondary">
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  );
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
