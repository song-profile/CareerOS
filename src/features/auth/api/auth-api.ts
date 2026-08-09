import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type { CurrentUserDto, CurrentUserViewModel } from "@/features/auth/api/dto";
import { toCurrentUserViewModel } from "@/features/auth/api/mapper";

export const authApi = {
  endpoints: {
    currentUser: defineEndpoint<void, CurrentUserDto, CurrentUserViewModel>({
      method: "GET",
      path: apiEndpoints.auth.me,
      response: toCurrentUserViewModel,
    }),
    logout: defineEndpoint({
      method: "POST",
      path: apiEndpoints.auth.logout,
    }),
    googleStart: defineEndpoint({
      method: "GET",
      path: apiEndpoints.oauth.googleStart,
    }),
  },
  mapper: {
    toCurrentUserViewModel,
  },
};

export async function getCurrentUser(): Promise<CurrentUserViewModel> {
  const dto = await apiClient<CurrentUserDto>(apiEndpoints.auth.me);
  return toCurrentUserViewModel(dto);
}

export async function logout(): Promise<void> {
  await apiClient<void>(apiEndpoints.auth.logout, { method: "POST" });
}

export const authApiContract: ApiModuleContract = {
  moduleName: "authApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /oauth2/authorization/google",
    "GET /login/oauth2/code/google",
    "GET /api/auth/me",
    "POST /api/auth/logout",
  ],
  notes: [
    "Spring Security Session + HttpOnly JSESSIONID Cookie를 사용합니다.",
    "프론트엔드는 Google Access Token, Authorization Code, JWT를 직접 다루지 않습니다.",
    "apiClient는 credentials: include로 세션 쿠키를 포함합니다.",
  ],
};
