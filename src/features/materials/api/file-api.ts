import type { ApiModuleContract } from "@/lib/api/types";

export const fileApiContract: ApiModuleContract = {
  moduleName: "fileApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "파일 목록 조회",
    "파일 업로드",
    "파일 다운로드",
    "파일 삭제",
    "파일 사용처 조회",
  ],
  notes: [
    "파일 업로드 Content-Type과 FormData 필드명 확인이 필요합니다.",
    "FormData 요청은 Content-Type을 직접 지정하지 않습니다.",
    "S3 presigned URL 사용 여부 확인이 필요합니다.",
  ],
};
