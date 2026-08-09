import { ApiClientError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { serverApiRequest } from "@/lib/api/server-client";
import { createServerCookieHeader } from "@/lib/api/server-cookie";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { CurrentUserDto, CurrentUserViewModel } from "@/features/auth/api/dto";
import { toCurrentUserViewModel } from "@/features/auth/api/mapper";

export type AuthState =
  | { status: "authenticated"; user: CurrentUserViewModel }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function getCurrentUserFromSession(): Promise<AuthState> {
  // 세션 쿠키가 없으면 요청 자체가 낭비다. 401을 받아 봐야 결론이 같다.
  if (!(await createServerCookieHeader())) {
    return { status: "unauthenticated" };
  }

  try {
    const dto = await serverApiRequest<CurrentUserDto>(apiEndpoints.auth.me);
    return { status: "authenticated", user: toCurrentUserViewModel(dto) };
  } catch (error) {
    // 여기서 401은 오류가 아니라 "로그인 안 됨"이라는 답이다.
    if (error instanceof ApiClientError && error.kind === "unauthorized") {
      return { status: "unauthenticated" };
    }

    // 원인을 삼키면 화면에는 "확인할 수 없습니다"만 남아 디버깅이 불가능하다.
    console.error(
      `[auth] GET ${apiEndpoints.auth.me} 실패:`,
      error instanceof ApiClientError ? `${error.kind} status=${error.status ?? "-"}` : error,
    );

    return { status: "error", message: getApiErrorMessage(error, "로그인 상태를 확인") };
  }
}
