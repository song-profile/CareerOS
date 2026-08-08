import { ApiClientError } from "@/lib/api/client";
import type { ApiErrorKind } from "@/lib/api/errors";

const defaultKindMessages: Record<ApiErrorKind, string> = {
  network: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
  api: "요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  validation: "입력값을 확인해 주세요.",
  unauthorized: "로그인이 필요합니다. 다시 로그인해 주세요.",
  forbidden: "접근 권한이 없습니다.",
  notFound: "요청한 정보를 찾을 수 없습니다.",
  conflict: "이미 처리되었거나 충돌이 발생했습니다.",
  server: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

export function getApiClientErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError) {
    return error.message.trim() || defaultKindMessages[error.kind] || fallbackMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function getHttpStatusFromError(error: unknown): number | undefined {
  if (error instanceof ApiClientError) {
    return error.status;
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

export function getServerResultErrorMessage(status: number | undefined, fallbackMessage: string): string {
  if (status === 401) {
    return "로그인이 필요합니다. 다시 로그인해 주세요.";
  }

  if (status === 403) {
    return "접근 권한이 없습니다.";
  }

  if (status === 404) {
    return "요청한 정보를 찾을 수 없습니다.";
  }

  if (status === 409) {
    return "이미 처리되었거나 충돌이 발생했습니다.";
  }

  if (status === 400 || status === 422) {
    return "입력값을 확인해 주세요.";
  }

  if (status !== undefined && status >= 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return fallbackMessage;
}
