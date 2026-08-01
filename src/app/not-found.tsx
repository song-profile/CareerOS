import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-12 text-neutral-900">
      <div className="grid w-full max-w-md gap-4 rounded-card border border-neutral-200 bg-neutral-0 p-6">
        <div className="grid gap-2">
          <h1 className="text-h1">페이지를 찾을 수 없습니다.</h1>
          <p className="text-body text-neutral-600">
            요청한 경로가 없거나 아직 준비되지 않은 화면입니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-fit items-center justify-center rounded-control bg-primary-600 px-4 text-body-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          href="/dashboard"
        >
          대시보드로 이동
        </Link>
      </div>
    </main>
  );
}
