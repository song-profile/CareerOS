export const API_BASE_URL_ENV_KEY = "NEXT_PUBLIC_API_BASE_URL";
export const GOOGLE_OAUTH_START_PATH_ENV_KEY = "NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH";

const DEFAULT_GOOGLE_OAUTH_START_PATH = "/oauth2/authorization/google";

export function getApiBaseUrl(): string {
  const value = process.env[API_BASE_URL_ENV_KEY]?.trim();

  if (!value) {
    throw new Error(`${API_BASE_URL_ENV_KEY} is not configured.`);
  }

  return value;
}

export function getGoogleOAuthStartPath(): string {
  return process.env[GOOGLE_OAUTH_START_PATH_ENV_KEY]?.trim() || DEFAULT_GOOGLE_OAUTH_START_PATH;
}
