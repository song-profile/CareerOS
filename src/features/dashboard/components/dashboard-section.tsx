import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ErrorStateCard, StateCard } from "@/components/ui/state-card";

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
  onRetry?: () => void;
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
  return <StateCard description={description} title={title} />;
}

export function DashboardErrorState({ description, onRetry, title }: ErrorStateProps) {
  return <ErrorStateCard message={description} onRetry={onRetry} title={title} />;
}

export function DashboardSkeletonCard() {
  return (
    <Card aria-label="데이터를 불러오는 중입니다.">
      <CardContent>
        <div className="grid gap-3">
          <SkeletonBlock className="h-4 w-2/3 rounded-full" />
          <SkeletonBlock className="h-3 w-full rounded-full" />
          <SkeletonBlock className="h-3 w-5/6 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
