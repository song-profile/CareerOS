import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="grid gap-2">
        <h1 className="text-h1 text-neutral-900">{title}</h1>
        {description ? <p className="max-w-3xl text-body text-neutral-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
    </header>
  );
}
