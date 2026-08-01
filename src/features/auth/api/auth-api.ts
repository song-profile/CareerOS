import type { ApiModuleContract } from "@/lib/api/types";

export const authApiContract: ApiModuleContract = {
  moduleName: "authApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "Google OAuth 시작",
    "Google OAuth Callback",
    "로그아웃",
    "현재 사용자 조회",
    "회원가입",
    "로그인",
    "비밀번호 찾기 또는 준비 중 정책",
  ],
  notes: [
    "인증 방식은 백엔드 명세가 없어 미확정입니다.",
    "OAuth 시작 URL은 NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH가 설정된 경우에만 사용합니다.",
    "HttpOnly Cookie 방식이면 apiClient의 credentials: include를 사용합니다.",
    "Bearer Token 방식이면 저장 위치와 refresh 흐름 합의 후 구현합니다.",
  ],
};
