import type { ApiModuleContract } from "@/lib/api/types";

export const essayApiContract: ApiModuleContract = {
  moduleName: "essayApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "자소서 목록 조회",
    "자소서 답변 상세 조회",
    "초안 저장",
    "버전 생성",
    "버전 목록 조회",
    "제출본 잠금",
  ],
  notes: [
    "태그는 이름이 아니라 id로 교환될 가능성이 있어 mapper 위치를 별도로 둡니다.",
    "버전 번호는 서버가 최종 결정해야 합니다.",
  ],
};
