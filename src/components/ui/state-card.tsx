import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

type StateActionVariant = "primary" | "secondary" | "danger";

interface StateCardProps {
  title: string;
  description?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: StateActionVariant;
  className?: string;
}

export function StateCard({
  actionHref,
  actionLabel,
  actionVariant = "secondary",
  className,
  description,
  onAction,
  title,
}: StateCardProps) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            {description ? <div className="text-body text-neutral-600">{description}</div> : null}
          </div>
          {actionHref && actionLabel ? (
            <LinkButton className="w-full sm:w-fit" href={actionHref} size="sm" variant={actionVariant}>
              {actionLabel}
            </LinkButton>
          ) : null}
          {onAction && actionLabel && !actionHref ? (
            <Button className="w-full sm:w-fit" onClick={onAction} size="sm" variant={actionVariant}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorStateCardProps {
  title: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorStateCard({
  message = "잠시 후 다시 시도해 주세요.",
  onRetry,
  title,
}: ErrorStateCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">{message}</p>
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
