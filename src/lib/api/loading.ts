export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type AsyncDataState<TValue> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: TValue | null; error: null }
  | { status: "success"; data: TValue; error: null }
  | { status: "error"; data: TValue | null; error: string };

export function createIdleState<TValue>(): AsyncDataState<TValue> {
  return { status: "idle", data: null, error: null };
}

export function createLoadingState<TValue>(
  data: TValue | null = null,
): AsyncDataState<TValue> {
  return { status: "loading", data, error: null };
}
