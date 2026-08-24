import Image from "next/image";
import { redirect } from "next/navigation";
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

const termsUrl = "#";
const privacyUrl = "#";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const authState = await getCurrentUserFromSession();

  if (authState.status === "authenticated") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = getSingleParam(params?.error);

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-0 top-0 h-px w-full bg-neutral-200/80" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-white/80" />
        <div className="absolute left-[calc(50%-320px)] top-0 h-full w-px bg-white/70" />
        <div className="absolute right-[calc(50%-320px)] top-0 h-full w-px bg-neutral-200/50" />
      </div>

      <div
        aria-labelledby="login-gate-title"
        aria-modal="true"
        className="relative z-10 grid min-h-screen place-items-center px-5 py-10"
        role="dialog"
      >
        <div className="grid w-full justify-items-center gap-5">
          <div className="grid w-full max-w-[420px] gap-7 rounded-modal border border-neutral-200/90 bg-white p-6 text-center shadow-[0_18px_48px_rgba(31,29,26,0.10)] sm:p-8">
            <div className="grid justify-items-center gap-4">
              <Image
                alt="CareerDock"
                className="h-14 w-14 rounded-control border border-neutral-200/80 shadow-[0_1px_2px_rgba(31,29,26,0.10)]"
                height={56}
                src="/logo.jpeg"
                width={56}
              />
              <div className="grid gap-2">
                <h1 className="text-h1 text-neutral-900" id="login-gate-title">
                  CareerDock
                </h1>
                <p className="mx-auto max-w-[320px] text-body text-neutral-600">
                  지원 자료와 일정을 조용하게 정리하는 개인 워크스페이스
                </p>
              </div>
            </div>

            <LoginForm
              initialServerError={error ? loginMessages[error] ?? "로그인이 필요합니다." : undefined}
            />
          </div>
          <LoginLegalLinks />
        </div>
      </div>
      <ChatbotPlaceholder />
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function LoginLegalLinks() {
  return (
    <nav aria-label="로그인 약관" className="grid justify-items-center gap-1 text-body-medium text-neutral-400">
      <a className="rounded-badge px-2 py-0.5 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2" href={termsUrl}>
        이용약관
      </a>
      <a className="rounded-badge px-2 py-0.5 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2" href={privacyUrl}>
        개인정보처리방침
      </a>
    </nav>
  );
}

function ChatbotPlaceholder() {
  return (
    <div
      aria-label="챗봇 영역 준비 중"
      className="fixed bottom-5 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200/90 bg-neutral-900 text-white shadow-[0_16px_38px_rgba(31,29,26,0.18)] sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
      role="img"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M5.5 6.5h13A2.5 2.5 0 0 1 21 9v5.5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3h-1A2.5 2.5 0 0 1 3 14.5V9a2.5 2.5 0 0 1 2.5-2.5z" />
        <path d="M8 11.5h.01" />
        <path d="M12 11.5h.01" />
        <path d="M16 11.5h.01" />
      </svg>
      <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
    </div>
  );
}
