export type ApplicationStatus =
  | "관심"
  | "작성중"
  | "지원완료"
  | "서류"
  | "필기"
  | "면접"
  | "최종합격"
  | "불합격";

export type RecruitmentSeason = "상반기" | "하반기" | "수시";

export interface ApplicationListItem {
  id: string;
  companyName: string;
  position: string;
  recruitmentYear: number;
  season: RecruitmentSeason;
  deadline: Date;
  status: ApplicationStatus;
  progress: number;
  createdAt: Date;
}

export type ApplicationStatusFilter = "전체" | "작성중" | "지원완료" | "면접" | "합격";
export type ApplicationSortKey = "deadline" | "companyName";

export interface ApplicationListState {
  searchQuery: string;
  statusFilter: ApplicationStatusFilter;
  sortKey: ApplicationSortKey;
}
