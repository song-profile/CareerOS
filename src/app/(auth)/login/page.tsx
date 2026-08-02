import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
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
    <AuthLayout description="저장한 지원 자료와 일정을 다시 확인하려면 로그인하세요." title="로그인">
      <LoginForm
        initialMessage={loggedOut ? "로그아웃되었습니다." : undefined}
        initialServerError={error ? loginMessages[error] ?? "로그인이 필요합니다." : undefined}
      />
    </AuthLayout>
  );
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
