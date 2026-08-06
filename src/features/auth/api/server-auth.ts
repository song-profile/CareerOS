import { ApiClientError, createApiUrl } from "@/lib/api/client";
import { createServerCookieHeader } from "@/lib/api/server-cookie";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { CurrentUserDto, CurrentUserViewModel } from "@/features/auth/api/dto";
import { toCurrentUserViewModel } from "@/features/auth/api/mapper";

export type AuthState =
  | { status: "authenticated"; user: CurrentUserViewModel }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function getCurrentUserFromSession(): Promise<AuthState> {
  const cookieHeader = await createServerCookieHeader();

  if (!cookieHeader) {
    return { status: "unauthenticated" };
  }

  try {
    const response = await fetch(createApiUrl(apiEndpoints.auth.me), {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    });

    if (response.status === 401) {
      return { status: "unauthenticated" };
    }

    if (!response.ok) {
      // 원인을 삼키면 화면에는 "확인할 수 없습니다"만 남아 디버깅이 불가능하다.
      console.error(`[auth] GET ${apiEndpoints.auth.me} -> ${response.status}`);
      return { status: "error", message: "로그인 상태를 확인할 수 없습니다." };
    }

    const dto = (await response.json()) as CurrentUserDto;
    return { status: "authenticated", user: toCurrentUserViewModel(dto) };
  } catch (error) {
    if (error instanceof ApiClientError && error.kind === "unauthorized") {
      return { status: "unauthenticated" };
    }

    console.error("[auth] 세션 확인 요청 실패:", error);
    return { status: "error", message: "인증 서버에 연결할 수 없습니다." };
  }
}
