import { createApiUrl } from "@/lib/api/client";
import { createHttpError, createNetworkError } from "@/lib/api/errors";
import { createServerCookieHeader } from "@/lib/api/server-cookie";
import type { ApiQueryParams } from "@/lib/api/types";

/**
 * 서버 컴포넌트에서 백엔드를 부르는 단 하나의 자리.
 *
 * 서버에는 브라우저 쿠키 항아리가 없어 apiClient의 credentials:"include"가 통하지 않는다.
 * 세션 쿠키를 직접 실어 보내는 대신, 실패는 apiClient와 똑같이 ApiClientError로 던진다 —
 * 그래야 같은 401이 클라이언트에서든 서버에서든 같은 문구가 된다.
 */
export async function serverApiRequest<TValue>(
  path: string,
  query?: ApiQueryParams,
): Promise<TValue> {
  let response: Response;

  try {
    response = await fetch(createApiUrl(path, query), {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: await createServerCookieHeader(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw createNetworkError(message, error);
  }

  const body = response.status === 204 ? undefined : await parseBody(response);

  if (!response.ok) {
    throw createHttpError(response.status, body, response.headers);
  }

  return body as TValue;
}

async function parseBody(response: Response): Promise<unknown> {
  return response.headers.get("content-type")?.includes("application/json")
    ? response.json()
    : response.text();
}
