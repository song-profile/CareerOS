import { addDays, getDaysUntil, setTime } from "@/features/dashboard/date-utils";
import type { DashboardData } from "@/features/dashboard/types";

const today = new Date();

const upcomingDeadlines = [
  {
    applicationId: "app-kb-2026-it",
    companyName: "KB국민은행",
    roleName: "IT 개발",
    dueAt: setTime(addDays(today, 2), 18, 0),
    status: "작성 중",
    completionRate: 78,
    incompleteItems: ["최종 검토", "포트폴리오 연결"],
    detailHref: "/applications/app-kb-2026-it",
  },
  {
    applicationId: "app-shinhan-ict",
    companyName: "신한은행",
    roleName: "ICT",
    dueAt: setTime(addDays(today, 6), 23, 59),
    status: "작성 중",
    completionRate: 20,
    incompleteItems: ["자소서 작성", "필수 파일 연결", "최종 검토"],
    detailHref: "/applications/app-shinhan-ict",
  },
  {
    applicationId: "app-kakao-backend",
    companyName: "카카오",
    roleName: "백엔드",
    dueAt: setTime(addDays(today, 10), 17, 0),
    status: "지원 완료",
    completionRate: 100,
    incompleteItems: [],
    detailHref: "/applications/app-kakao-backend",
  },
] satisfies DashboardData["upcomingDeadlines"];

const recruitmentEvents = [
  {
    id: "event-kb-coding-test",
    type: "코딩테스트",
    companyName: "KB국민은행",
    roleName: "IT 개발",
    startsAt: setTime(addDays(today, 4), 10, 0),
    location: "온라인",
    applicationId: "app-kb-2026-it",
  },
  {
    id: "event-kakao-interview",
    type: "1차 면접",
    companyName: "카카오",
    roleName: "백엔드",
    startsAt: setTime(addDays(today, 12), 14, 30),
    location: "판교 오피스",
    applicationId: "app-kakao-backend",
  },
] satisfies DashboardData["recruitmentEvents"];

const expiringCredentials = [
  {
    id: "credential-sqld",
    name: "SQLD",
    type: "자격증",
    expiresAt: addDays(today, 28),
    remainingDays: getDaysUntil(addDays(today, 28), today),
    detailHref: "/materials/credentials/credential-sqld",
  },
  {
    id: "credential-toeic",
    name: "TOEIC",
    type: "어학",
    expiresAt: addDays(today, 45),
    remainingDays: getDaysUntil(addDays(today, 45), today),
    detailHref: "/materials/credentials/credential-toeic",
  },
] satisfies DashboardData["expiringCredentials"];

const recentResources = [
  {
    id: "essay-kb-motivation",
    type: "자소서",
    title: "KB국민은행 지원동기 답변",
    context: "지원동기",
    lastOpenedAt: setTime(addDays(today, -1), 16, 10),
    href: "/essays/essay-kb-motivation",
  },
  {
    id: "file-portfolio",
    type: "파일",
    title: "백엔드 포트폴리오 PDF",
    context: "포트폴리오",
    lastOpenedAt: setTime(addDays(today, -3), 9, 20),
    href: "/materials/file-portfolio",
  },
] satisfies DashboardData["recentResources"];

export const dashboardMockData: DashboardData = {
  summary: {
    weeklyDeadlineCount: upcomingDeadlines.filter((deadline) => {
      const daysUntil = getDaysUntil(deadline.dueAt, today);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length,
    upcomingEventCount: recruitmentEvents.length,
    draftingApplicationCount: upcomingDeadlines.filter((deadline) => deadline.status === "작성 중").length,
  },
  upcomingDeadlines,
  recruitmentEvents,
  expiringCredentials,
  recentResources,
};
