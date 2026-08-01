import { applicationMockData } from "@/features/applications/mock-data";
import type { ApplicationDetail } from "@/features/applications/detail-types";

const detailById: Record<string, Omit<ApplicationDetail, keyof (typeof applicationMockData)[number]>> = {
  "app-kb-2026-it": {
    basicInfo: {
      postingUrl: "https://careers.example.com/kb-it",
      workLocation: "서울",
      memo: "마감 전 포트폴리오 최종 링크와 자소서 2번 문항을 다시 확인해야 합니다.",
    },
    materials: [
      {
        id: "kb-photo",
        type: "증명사진",
        title: "증명사진_2026.jpg",
        isReady: true,
        placeholderHref: "#materials",
      },
      {
        id: "kb-portfolio",
        type: "포트폴리오",
        title: "백엔드_포트폴리오.pdf",
        isReady: false,
        placeholderHref: "#materials",
      },
      {
        id: "kb-certificate",
        type: "자격증",
        title: "정보처리기사.pdf",
        isReady: true,
        placeholderHref: "#materials",
      },
      {
        id: "kb-transcript",
        type: "성적증명서",
        title: "성적증명서.pdf",
        isReady: false,
        placeholderHref: "#materials",
      },
    ],
    essay: {
      questionCount: 4,
      answerCount: 3,
      hasSubmittedVersion: false,
      href: "/essays",
    },
    checklist: [
      { id: "basic", label: "기본정보", isCompleted: true },
      { id: "essay", label: "자소서", isCompleted: false },
      { id: "portfolio", label: "포트폴리오", isCompleted: false },
      { id: "photo", label: "증명사진", isCompleted: true },
      { id: "review", label: "최종검토", isCompleted: false },
    ],
    histories: [
      {
        id: "history-kb-1",
        status: "관심",
        changedAt: applicationMockData[0].createdAt,
        changedBy: "사용자",
      },
      {
        id: "history-kb-2",
        status: "작성중",
        changedAt: new Date(applicationMockData[0].createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        changedBy: "사용자",
      },
    ],
  },
};

function createFallbackDetail(application: (typeof applicationMockData)[number]): ApplicationDetail {
  return {
    ...application,
    basicInfo: {
      postingUrl: "",
      workLocation: "미정",
      memo: "상세 정보는 다음 단계에서 실제 데이터로 확장됩니다.",
    },
    materials: [],
    essay: {
      questionCount: 0,
      answerCount: 0,
      hasSubmittedVersion: false,
      href: "/essays",
    },
    checklist: [
      { id: "basic", label: "기본정보", isCompleted: application.progress >= 20 },
      { id: "essay", label: "자소서", isCompleted: application.progress >= 60 },
      { id: "portfolio", label: "포트폴리오", isCompleted: application.progress >= 80 },
      { id: "photo", label: "증명사진", isCompleted: application.progress >= 40 },
      { id: "review", label: "최종검토", isCompleted: application.progress >= 100 },
    ],
    histories: [
      {
        id: `${application.id}-history-created`,
        status: application.status,
        changedAt: application.createdAt,
        changedBy: "사용자",
      },
    ],
  };
}

export const applicationDetailMockData: ApplicationDetail[] = applicationMockData.map((application) => {
  const detail = detailById[application.id];

  if (!detail) {
    return createFallbackDetail(application);
  }

  return {
    ...application,
    ...detail,
  };
});
