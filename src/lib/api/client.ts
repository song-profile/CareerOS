const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody: unknown,
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export class ApiNetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ApiNetworkError";
  }
}

function createUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new ApiNetworkError("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return new URL(path, API_BASE_URL).toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
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
  const { body, headers, ...requestOptions } = options;

  try {
    const response = await fetch(createUrl(path), {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiHttpError("API request failed.", response.status, responseBody);
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof ApiHttpError || error instanceof ApiNetworkError) {
      throw error;
    }

    throw new ApiNetworkError("Network request failed.", error);
  }
}
