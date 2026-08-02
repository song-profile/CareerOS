import { createApiUrl } from "@/lib/api/client";
import { getGoogleOAuthStartPath } from "@/lib/api/env";

export function getGoogleOAuthStartUrl(): string | null {
  try {
    return createApiUrl(getGoogleOAuthStartPath());
  } catch {
    return null;
  }
}
