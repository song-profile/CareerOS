import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, description, title }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10">
      <div className="grid w-full max-w-[460px] gap-8">
        <header className="grid gap-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-primary-600 text-body-medium text-white">
            CD
          </div>
          <div className="grid gap-2">
            <p className="text-h2 text-neutral-900">CareerDock</p>
            <p className="text-body text-neutral-600">
              취업 준비의 모든 자료와 일정을 한곳에서 관리하세요.
            </p>
          </div>
        </header>

        <section className="rounded-card border border-neutral-200 bg-neutral-0 px-5 py-6 sm:px-6">
          <div className="mb-6 grid gap-2">
            <h1 className="text-h1 text-neutral-900">{title}</h1>
            <p className="text-body text-neutral-600">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
