import {
  ApiClientError,
  createHttpError,
  createNetworkError,
} from "@/lib/api/errors";
import type { ApiQueryParams } from "@/lib/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiRequestBody = BodyInit | Record<string, unknown> | unknown[] | null;

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: ApiRequestBody;
  query?: ApiQueryParams;
}

export { ApiClientError };

export function createApiUrl(path: string, query?: ApiQueryParams): string {
  if (!API_BASE_URL) {
    throw createNetworkError("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const url = new URL(path, API_BASE_URL);

  if (query) {
    appendQueryParams(url, query);
  }

  return url.toString();
}

function appendQueryParams(url: URL, query: ApiQueryParams) {
  Object.entries(query).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (item !== null && item !== undefined) {
        url.searchParams.append(key, String(item));
      }
    });
  });
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const { body, headers, query, ...requestOptions } = options;
  const requestBody = createRequestBody(body);
  const requestHeaders = createRequestHeaders(headers, body);

  try {
    const response = await fetch(createApiUrl(path, query), {
      credentials: "include",
      ...requestOptions,
      headers: requestHeaders,
      body: requestBody,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw createHttpError(response.status, responseBody);
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw createNetworkError("Network request failed.", error);
  }
}

function createRequestHeaders(
  headers: HeadersInit | undefined,
  body: ApiRequestBody | undefined,
): Headers {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (body !== undefined && shouldSerializeJson(body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
}

function createRequestBody(body: ApiRequestBody | undefined): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body === null) {
    return undefined;
  }

  if (shouldSerializeJson(body)) {
    return JSON.stringify(body);
  }

  return body;
}

function shouldSerializeJson(body: ApiRequestBody): body is Record<string, unknown> | unknown[] {
  return !isBodyInit(body);
}

function isBodyInit(body: ApiRequestBody): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  );
}
