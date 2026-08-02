import { ApiClientError } from "@/lib/api/client";

export type ApiResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: ApiClientError; message: string };

export async function toApiResult<TValue>(
  request: Promise<TValue>,
): Promise<ApiResult<TValue>> {
  try {
    return { ok: true, value: await request };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error, message: error.message };
    }

    const fallbackError = new ApiClientError(
      "network",
      "요청을 처리하는 중 오류가 발생했습니다.",
      {},
      error,
    );

    return { ok: false, error: fallbackError, message: fallbackError.message };
  }
}
