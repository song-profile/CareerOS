import { createApiUrl } from "@/lib/api/client";

const GOOGLE_OAUTH_START_PATH = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH;

export function getGoogleOAuthStartUrl(): string | null {
  if (!GOOGLE_OAUTH_START_PATH) {
    return null;
  }

  return createApiUrl(GOOGLE_OAUTH_START_PATH);
}
