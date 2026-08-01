import type { SelectOption } from "@/components/ui/select";
import type { RecruitmentSeason } from "@/features/applications/types";

export const APPLICATION_STATUS_OPTIONS: SelectOption[] = [
  "관심",
  "작성중",
  "지원완료",
  "서류",
  "필기",
  "면접",
  "최종합격",
  "불합격",
].map((status) => ({
  label: status,
  value: status,
}));

export const RECRUITMENT_SEASON_OPTIONS: { label: RecruitmentSeason; value: RecruitmentSeason }[] = [
  { label: "상반기", value: "상반기" },
  { label: "하반기", value: "하반기" },
  { label: "수시", value: "수시" },
];
