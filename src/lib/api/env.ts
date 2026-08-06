export const API_BASE_URL_ENV_KEY = "NEXT_PUBLIC_API_BASE_URL";
export const GOOGLE_OAUTH_START_PATH_ENV_KEY = "NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH";

const DEFAULT_GOOGLE_OAUTH_START_PATH = "/oauth2/authorization/google";

// process.env는 반드시 정적 접근으로 쓴다. NEXT_PUBLIC_* 치환은 빌드 시점 문자열
// 치환이라, process.env[변수] 형태는 클라이언트 번들에서 undefined가 된다.
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new Error(`${API_BASE_URL_ENV_KEY} is not configured.`);
  }

  return value;
}

export function getGoogleOAuthStartPath(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH?.trim() || DEFAULT_GOOGLE_OAUTH_START_PATH;
}
