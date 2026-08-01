import type { ApiModuleContract } from "@/lib/api/types";

export const externalLinkApiContract: ApiModuleContract = {
  moduleName: "externalLinkApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "외부 링크 목록 조회",
    "외부 링크 등록",
    "외부 링크 수정",
    "외부 링크 삭제",
  ],
  notes: [
    "URL은 프론트에서 https 형식 검증을 하고, 서버에서도 동일하게 검증해야 합니다.",
  ],
};
