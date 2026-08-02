import { cookies } from "next/headers";
import { ApiClientError, createApiUrl } from "@/lib/api/client";
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
      return { status: "error", message: "로그인 상태를 확인할 수 없습니다." };
    }

    const dto = (await response.json()) as CurrentUserDto;
    return { status: "authenticated", user: toCurrentUserViewModel(dto) };
  } catch (error) {
    if (error instanceof ApiClientError && error.kind === "unauthorized") {
      return { status: "unauthenticated" };
    }

    return { status: "error", message: "인증 서버에 연결할 수 없습니다." };
  }
}

async function createServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
