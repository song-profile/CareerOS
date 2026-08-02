import { addDays, setTime } from "@/features/applications/date-utils";
import type { ApplicationListItem } from "@/features/applications/types";

const today = new Date();

export const calendarApplicationOptionMockData: ApplicationListItem[] = [
  {
    id: "app-kb-2026-it",
    companyName: "KB국민은행",
    position: "IT 개발",
    recruitmentYear: 2026,
    season: "하반기",
    deadline: setTime(addDays(today, 2), 18, 0),
    status: "작성중",
    progress: 78,
    createdAt: addDays(today, -9),
  },
  {
    id: "app-shinhan-ict",
    companyName: "신한은행",
    position: "ICT",
    recruitmentYear: 2026,
    season: "하반기",
    deadline: setTime(addDays(today, 6), 23, 59),
    status: "작성중",
    progress: 20,
    createdAt: addDays(today, -4),
  },
  {
    id: "app-kakao-backend",
    companyName: "카카오",
    position: "백엔드",
    recruitmentYear: 2026,
    season: "수시",
    deadline: setTime(addDays(today, 10), 17, 0),
    status: "지원완료",
    progress: 100,
    createdAt: addDays(today, -18),
  },
];
