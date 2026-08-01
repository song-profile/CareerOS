export type ApplicationStatus = "작성 중" | "지원 완료" | "면접" | "최종 결과";

export interface DashboardSummary {
  weeklyDeadlineCount: number;
  upcomingEventCount: number;
  draftingApplicationCount: number;
}

export interface UpcomingDeadline {
  applicationId: string;
  companyName: string;
  roleName: string;
  dueAt: Date;
  status: ApplicationStatus;
  completionRate: number;
  incompleteItems: string[];
  detailHref: string;
}

export type RecruitmentEventType = "코딩테스트" | "필기" | "1차 면접" | "최종 면접" | "과제 제출";

export interface RecruitmentEvent {
  id: string;
  type: RecruitmentEventType;
  companyName: string;
  roleName: string;
  startsAt: Date;
  location: string;
  applicationId: string;
}

export type CredentialType = "자격증" | "어학" | "증빙자료";

export interface ExpiringCredential {
  id: string;
  name: string;
  type: CredentialType;
  expiresAt: Date;
  remainingDays: number;
  detailHref: string;
}

export type RecentResourceType = "자소서" | "파일";

export interface RecentResource {
  id: string;
  type: RecentResourceType;
  title: string;
  context: string;
  lastOpenedAt: Date;
  href: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingDeadlines: UpcomingDeadline[];
  recruitmentEvents: RecruitmentEvent[];
  expiringCredentials: ExpiringCredential[];
  recentResources: RecentResource[];
}
