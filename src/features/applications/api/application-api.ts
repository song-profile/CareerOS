import type { ApiModuleContract } from "@/lib/api/types";

export const applicationApiContract: ApiModuleContract = {
  moduleName: "applicationApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "지원 목록 조회",
    "지원 상세 조회",
    "지원 등록",
    "지원 수정",
    "지원 삭제",
  ],
  notes: [
    "Pagination, 정렬, 검색, 상태 필터 요청/응답 형식 확인이 필요합니다.",
    "현재 UI는 ApplicationListItem과 ApplicationDetail View Model을 사용합니다.",
  ],
};
