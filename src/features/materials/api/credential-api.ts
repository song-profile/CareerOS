import type { ApiModuleContract } from "@/lib/api/types";

export const credentialApiContract: ApiModuleContract = {
  moduleName: "credentialApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "자격증·어학 목록 조회",
    "자격 상세 조회",
    "자격 등록",
    "자격 수정",
    "자격 삭제",
  ],
  notes: [
    "자격번호 암호화, 복호화, 마스킹 응답 정책 확인이 필요합니다.",
    "민감정보는 로그에 남기지 않습니다.",
  ],
};
