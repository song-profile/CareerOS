export default function AuthCallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="grid gap-3 text-center">
        <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary-600 border-r-transparent" />
        <p className="text-body-medium text-neutral-900">로그인 상태를 확인하는 중입니다.</p>
      </div>
    </main>
  );
}
