import type { ApiModuleContract } from "@/lib/api/types";

export const calendarApiContract: ApiModuleContract = {
  moduleName: "calendarApi",
  contractStatus: "pending",
  requiredEndpoints: [
    "일정 목록 조회",
    "일정 상세 조회",
    "일정 등록",
    "일정 수정",
    "일정 삭제",
  ],
  notes: [
    "googleEventId와 syncStatus는 Google Calendar 연동 단계에서 사용합니다.",
    "알림 규칙 channel 확장 정책 확인이 필요합니다.",
  ],
};
