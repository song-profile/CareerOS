export type ApiHttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface PreparedApiEndpoint<TRequest = void, TResponse = void, TViewModel = TResponse> {
  method: ApiHttpMethod;
  path: string | ((...params: Array<string | number>) => string);
  request?: (input: TRequest) => unknown;
  response?: (dto: TResponse) => TViewModel;
}

export function defineEndpoint<TRequest = void, TResponse = void, TViewModel = TResponse>(
  endpoint: PreparedApiEndpoint<TRequest, TResponse, TViewModel>,
): PreparedApiEndpoint<TRequest, TResponse, TViewModel> {
  return endpoint;
}
