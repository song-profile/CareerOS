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

export type ApiFieldErrors = Record<string, string>;

export interface ApiErrorPayload {
  status?: number;
  code?: string;
  message?: string;
  fieldErrors?: ApiFieldErrors;
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

export function createHttpError(status: number, responseBody: unknown, headers?: Headers) {
  const payload = normalizeErrorPayload(status, responseBody, headers);
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

/**
 * 화면에 띄울 오류 문구를 만드는 단 하나의 자리.
 *
 * 화면마다 문구를 직접 쓰면 같은 401이 어디서는 "로그인이 필요합니다", 어디서는
 * "다시 로그인해 주세요"가 된다. 종류별 문장 구조를 여기 한 곳에 두고, 화면은
 * 무슨 동작이었는지(action)만 넘긴다.
 *
 * action은 "지원 건을 저장"처럼 하다 동사가 붙는 구로 넘긴다.
 * ("지원 건을 저장" -> "지원 건을 저장할 수 없습니다.")
 */
const MESSAGE_TEMPLATES: Record<ApiErrorKind, (action: string) => string> = {
  unauthorized: (action) => `로그인이 만료되었습니다. 다시 로그인한 뒤 ${action}해 주세요.`,
  forbidden: (action) => `권한이 없어 ${action}할 수 없습니다.`,
  notFound: (action) => `대상을 찾을 수 없어 ${action}할 수 없습니다.`,
  conflict: (action) => `이미 변경된 정보입니다. 새로고침한 뒤 다시 ${action}해 주세요.`,
  validation: () => "입력값을 확인해 주세요.",
  network: (action) => `네트워크에 연결할 수 없어 ${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
  server: (action) => `서버 오류로 ${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
  api: (action) => `${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
};

/**
 * HTTP 상태를 그대로 옮긴 코드들. 서버 문구가 화면 문맥을 모르므로 위 템플릿이 낫다.
 * 반대로 GOOGLE_TOKEN_EXPIRED, DUPLICATE_RESOURCE처럼 서버만 아는 사정이 담긴 코드는
 * 서버 문구를 그대로 쓴다 — 여기서 일반 문구로 덮으면 원인이 사라진다.
 */
const GENERIC_SERVER_CODES = new Set([
  "BAD_REQUEST",
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
]);

export function getApiErrorMessage(error: unknown, action: string): string {
  if (!(error instanceof ApiClientError)) {
    return MESSAGE_TEMPLATES.network(action);
  }

  // 어느 입력이 왜 틀렸는지는 서버만 안다. 일반 문구보다 항상 유용하다.
  if (error.kind === "validation") {
    const fieldError = Object.values(error.fieldErrors ?? {})[0];
    return fieldError ?? MESSAGE_TEMPLATES.validation(action);
  }

  // payload.message로 확인한다. error.message는 서버가 아무 말도 안 했을 때
  // 기본 문구가 이미 채워져 있어 "서버가 말했는지"를 구분하지 못한다.
  const serverMessage = error.payload.message;
  if (serverMessage && error.code && !GENERIC_SERVER_CODES.has(error.code)) {
    return serverMessage;
  }

  return MESSAGE_TEMPLATES[error.kind](action);
}

function normalizeErrorPayload(
  status: number,
  responseBody: unknown,
  headers?: Headers,
): ApiErrorPayload {
  if (!isObjectRecord(responseBody)) {
    return {
      status,
      message: typeof responseBody === "string" && responseBody ? responseBody : undefined,
      requestId: headers?.get("X-Request-Id") ?? undefined,
      details: responseBody,
    };
  }

  return {
    status,
    code: getStringValue(responseBody.code),
    message: getStringValue(responseBody.message),
    fieldErrors: normalizeFieldErrors(responseBody.fieldErrors),
    requestId: getStringValue(responseBody.requestId) ?? headers?.get("X-Request-Id") ?? undefined,
    details: responseBody.details ?? responseBody,
  };
}

function normalizeFieldErrors(value: unknown): ApiFieldErrors | undefined {
  if (isObjectRecord(value)) {
    const entries = Object.entries(value)
      .map(([field, message]) => [field, getStringValue(message)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries = value
    .filter(isObjectRecord)
    .map((item) => ({
      field: getStringValue(item.field) ?? "",
      message: getStringValue(item.message) ?? "입력값을 확인해 주세요.",
    }))
    .filter((item) => item.field.length > 0)
    .map((item) => [item.field, item.message] as const);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
