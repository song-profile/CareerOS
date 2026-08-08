import { cookies } from "next/headers";
import { createApiUrl } from "@/lib/api/client";
import { getServerResultErrorMessage } from "@/lib/api/error-message";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { DashboardSummaryDto } from "@/features/dashboard/api/dto";
import { toDashboardData } from "@/features/dashboard/api/mapper";
import type { DashboardData } from "@/features/dashboard/types";

export type DashboardResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function getDashboardSummary(): Promise<DashboardResult<DashboardData>> {
  try {
    const response = await fetch(createApiUrl(apiEndpoints.dashboard.summary), {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: await createServerCookieHeader(),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: getServerResultErrorMessage(response.status, "대시보드를 불러올 수 없습니다."),
        status: response.status,
      };
    }

    const dto = (await response.json()) as DashboardSummaryDto;
    return { ok: true, value: toDashboardData(dto) };
  } catch {
    return { ok: false, message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요." };
  }
}

async function createServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
