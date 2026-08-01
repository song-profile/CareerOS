export type ApiErrorKind =
  | "network"
  | "api"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "server";

export interface ApiFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorPayload {
  status?: number;
  code?: string;
  message?: string;
  fieldErrors?: ApiFieldError[];
  requestId?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly payload: ApiErrorPayload = {},
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  get status() {
    return this.payload.status;
  }

  get code() {
    return this.payload.code;
  }

  get fieldErrors() {
    return this.payload.fieldErrors;
  }

  get requestId() {
    return this.payload.requestId;
  }

  get details() {
    return this.payload.details;
  }
}

export function createNetworkError(message: string, cause?: unknown) {
  return new ApiClientError("network", message, {}, cause);
}

export function createHttpError(status: number, responseBody: unknown) {
  const payload = normalizeErrorPayload(status, responseBody);
  const kind = getHttpErrorKind(status);
  const message = payload.message ?? getDefaultErrorMessage(kind);

  return new ApiClientError(kind, message, payload);
}

function getHttpErrorKind(status: number): ApiErrorKind {
  if (status === 401) {
    return "unauthorized";
  }

  if (status === 403) {
    return "forbidden";
  }

  if (status === 404) {
    return "notFound";
  }

  if (status === 409) {
    return "conflict";
  }

  if (status === 400 || status === 422) {
    return "validation";
  }

  if (status >= 500) {
    return "server";
  }

  return "api";
}

function getDefaultErrorMessage(kind: ApiErrorKind): string {
  const messages: Record<ApiErrorKind, string> = {
    network: "네트워크 연결에 실패했습니다.",
    api: "요청을 처리할 수 없습니다.",
    validation: "입력값을 확인해 주세요.",
    unauthorized: "로그인이 필요합니다.",
    forbidden: "접근 권한이 없습니다.",
    notFound: "요청한 정보를 찾을 수 없습니다.",
    conflict: "이미 처리되었거나 충돌이 발생했습니다.",
    server: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  };

  return messages[kind];
}

function normalizeErrorPayload(status: number, responseBody: unknown): ApiErrorPayload {
  if (!isObjectRecord(responseBody)) {
    return {
      status,
      message: typeof responseBody === "string" && responseBody ? responseBody : undefined,
      details: responseBody,
    };
  }

  return {
    status,
    code: getStringValue(responseBody.code),
    message: getStringValue(responseBody.message),
    fieldErrors: normalizeFieldErrors(responseBody.fieldErrors),
    requestId: getStringValue(responseBody.requestId),
    details: responseBody.details ?? responseBody,
  };
}

function normalizeFieldErrors(value: unknown): ApiFieldError[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isObjectRecord)
    .map((item) => ({
      field: getStringValue(item.field) ?? "",
      message: getStringValue(item.message) ?? "입력값을 확인해 주세요.",
      code: getStringValue(item.code),
    }))
    .filter((item) => item.field.length > 0);
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
