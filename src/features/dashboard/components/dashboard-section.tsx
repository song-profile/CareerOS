import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

interface EmptyStateProps {
  title: string;
  description: string;
}

interface ErrorStateProps {
  title: string;
  description: string;
}

export function DashboardSection({ children, description, title }: DashboardSectionProps) {
  const sectionTitleId = `dashboard-section-${title.replace(/\s+/g, "-")}`;

  return (
    <section className="grid gap-4" aria-labelledby={sectionTitleId}>
      <div className="grid gap-1">
        <h2 className="text-h2 text-neutral-900" id={sectionTitleId}>
          {title}
        </h2>
        <p className="text-body text-neutral-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function DashboardEmptyState({ description, title }: EmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-1">
          <p className="text-body-medium text-neutral-900">{title}</p>
          <p className="text-body text-neutral-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardErrorState({ description, title }: ErrorStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">{title}</p>
            <p className="text-body text-neutral-600">{description}</p>
          </div>
          <Button size="sm" variant="secondary">
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeletonCard() {
  return (
    <Card aria-label="데이터를 불러오는 중입니다.">
      <CardContent>
        <div className="grid gap-3">
          <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
          <div className="h-3 w-full rounded-full bg-neutral-100" />
          <div className="h-3 w-5/6 rounded-full bg-neutral-100" />
        </div>
      </CardContent>
    </Card>
  );
}
