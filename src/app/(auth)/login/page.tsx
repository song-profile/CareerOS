import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
import { DashboardPreview } from "@/features/auth/dashboard-preview";
import { LoginForm } from "@/features/auth/login-form";

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const loginMessages: Record<string, string> = {
  login_required: "로그인이 필요한 페이지입니다.",
  oauth_failed: "Google 로그인이 완료되지 않았습니다. 다시 시도해 주세요.",
  session_check_failed: "로그인 상태를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const authState = await getCurrentUserFromSession();

  if (authState.status === "authenticated") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = getSingleParam(params?.error);
  const loggedOut = getSingleParam(params?.loggedOut);

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-50">
      <DashboardPreview />

      <div
        aria-labelledby="login-gate-title"
        aria-modal="true"
        className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/45 px-6 backdrop-blur-sm"
        role="dialog"
      >
        <div className="grid w-full max-w-[400px] gap-6 rounded-modal border border-neutral-200 bg-neutral-0 p-6 text-center shadow-lg sm:p-8">
          <div className="grid justify-items-center gap-3">
            <Image
              alt="CareerDock"
              className="h-11 w-11 rounded-control"
              height={44}
              src="/logo.jpeg"
              width={44}
            />
            <div className="grid gap-1">
              <h1 className="text-h1 text-neutral-900" id="login-gate-title">
                Google 계정으로 시작하기
              </h1>
              <p className="text-body text-neutral-600">
                지원 자료와 일정을 한곳에서 관리하려면 먼저 로그인해 주세요.
              </p>
            </div>
          </div>

          <LoginForm
            initialMessage={loggedOut ? "로그아웃되었습니다." : undefined}
            initialServerError={error ? loginMessages[error] ?? "로그인이 필요합니다." : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
