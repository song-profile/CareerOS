import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, description, title }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10">
      <div className="grid w-full max-w-[420px] gap-7">
        <header className="grid gap-3 text-center">
          <Image
            alt="CareerDock"
            className="mx-auto h-10 w-10 rounded-control"
            height={40}
            src="/logo.jpeg"
            width={40}
          />
          <div className="grid gap-2">
            <p className="text-h2 text-neutral-900">CareerDock</p>
            <p className="text-body text-neutral-600">지원 현황과 자료를 한곳에 정리하세요.</p>
          </div>
        </header>

        <section className="rounded-card border border-neutral-200 bg-neutral-0 px-5 py-6 sm:px-6">
          <div className="mb-5 grid gap-2">
            <h1 className="text-h1 text-neutral-900">{title}</h1>
            <p className="text-body text-neutral-600">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
