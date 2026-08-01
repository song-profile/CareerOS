export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16">
      <section className="w-full max-w-2xl rounded-[14px] border border-neutral-200 bg-white px-6 py-8 text-center sm:px-10 sm:py-12">
        <p className="text-sm font-medium text-primary-600">프로젝트 준비 완료</p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">CareerDock</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          취업 준비의 모든 자료와 일정을 한곳에서 관리하세요.
        </p>
      </section>
    </main>
  );
}
