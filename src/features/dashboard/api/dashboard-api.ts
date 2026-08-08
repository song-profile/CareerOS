import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type { DashboardSummaryDto } from "@/features/dashboard/api/dto";
import { toDashboardData } from "@/features/dashboard/api/mapper";
import type { DashboardData } from "@/features/dashboard/types";

export const dashboardApi = {
  endpoints: {
    summary: defineEndpoint<void, DashboardSummaryDto, DashboardData>({
      method: "GET",
      path: apiEndpoints.dashboard.summary,
      response: toDashboardData,
    }),
  },
  mapper: {
    toDashboardData,
  },
};

export async function fetchDashboardSummary(): Promise<DashboardData> {
  const dto = await apiClient<DashboardSummaryDto>(apiEndpoints.dashboard.summary);
  return toDashboardData(dto);
}

export const dashboardApiContract: ApiModuleContract = {
  moduleName: "dashboardApi",
  contractStatus: "confirmed",
  requiredEndpoints: ["GET /api/dashboard/summary"],
  notes: [
    "Dashboard 첫 화면은 Summary endpoint 한 번으로 데이터를 조회합니다.",
    "apiClient는 credentials: include로 Spring Session 쿠키를 포함합니다.",
    "DTO는 mapper를 거쳐 Dashboard ViewModel로 변환합니다.",
  ],
};
