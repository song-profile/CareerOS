import {
  ApiClientError,
  createHttpError,
  createNetworkError,
} from "@/lib/api/errors";
import { getApiBaseUrl } from "@/lib/api/env";
import type { ApiQueryParams } from "@/lib/api/types";

type ApiRequestBody = BodyInit | object | null;

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: ApiRequestBody;
  query?: ApiQueryParams;
}

export { ApiClientError };

export function createApiUrl(path: string, query?: ApiQueryParams): string {
  const url = new URL(path, getApiBaseUrl());

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
      throw createHttpError(response.status, responseBody, response.headers);
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Network request failed.";
    throw createNetworkError(message, error);
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

function shouldSerializeJson(body: ApiRequestBody): body is object {
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
