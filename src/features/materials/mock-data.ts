import { addDays } from "@/features/applications/date-utils";
import type {
  ExternalLink,
  MaterialFile,
  ProfileField,
  UserProfile,
} from "@/features/materials/types";

const today = new Date();

/**
 * 화면 확인용 예시 데이터.
 * 실제 개인정보와 실제 자격번호는 쓰지 않는다. 전화번호는 방송·예시용으로 비워둔
 * 010-0000-XXXX 대역을, 주소와 자격번호는 명백한 가상 값을 쓴다.
 */
export const userProfileMockData: UserProfile = {
  name: "홍길동",
  email: "hong.example@example.com",
  phone: "010-0000-0000",
  address: "서울특별시 예시구 예시로 000",
  school: "예시대학교",
  major: "컴퓨터공학과",
  doubleMajor: "",
  gpa: "3.082 / 4.5",
  militaryService: "군필 · 육군 병장 만기전역",
  careerSummary: "씨앤태크 ICT 인턴 6개월 · LOODI 서비스 운영",
};

export function toProfileFields(profile: UserProfile): ProfileField[] {
  return [
    { key: "name", label: "이름", value: profile.name, sensitive: false, copyable: true },
    { key: "email", label: "이메일", value: profile.email, sensitive: false, copyable: true },
    { key: "phone", label: "전화번호", value: profile.phone, sensitive: true, copyable: true },
    { key: "address", label: "주소", value: profile.address, sensitive: true, copyable: true },
    { key: "school", label: "학교", value: profile.school, sensitive: false, copyable: true },
    { key: "major", label: "주전공", value: profile.major, sensitive: false, copyable: true },
    {
      key: "doubleMajor",
      label: "복수전공",
      value: profile.doubleMajor,
      sensitive: false,
      copyable: true,
    },
    { key: "gpa", label: "학점", value: profile.gpa, sensitive: false, copyable: true },
    {
      key: "militaryService",
      label: "병역사항",
      value: profile.militaryService,
      sensitive: false,
      copyable: true,
    },
    {
      key: "careerSummary",
      label: "경력·인턴",
      value: profile.careerSummary,
      sensitive: false,
      copyable: true,
    },
  ];
}


export const materialFileMockData: MaterialFile[] = [
  {
    id: "file-profile-photo-2026",
    fileName: "증명사진_2026.jpg",
    type: "증명사진",
    size: 842_120,
    createdAt: addDays(today, -18),
    isUsed: true,
    downloadUrl: "#",
  },
  {
    id: "file-backend-portfolio",
    fileName: "백엔드_포트폴리오.pdf",
    type: "포트폴리오",
    size: 5_382_144,
    createdAt: addDays(today, -12),
    isUsed: true,
    downloadUrl: "#",
  },
  {
    id: "file-transcript",
    fileName: "성적증명서.pdf",
    type: "성적증명서",
    size: 1_248_900,
    createdAt: addDays(today, -42),
    isUsed: false,
    downloadUrl: "#",
  },
  {
    id: "file-graduation-certificate",
    fileName: "졸업예정증명서.pdf",
    type: "졸업증명서",
    size: 1_012_340,
    createdAt: addDays(today, -35),
    isUsed: false,
    downloadUrl: "#",
  },
  {
    id: "file-engineer-info",
    fileName: "정보처리기사_자격증.pdf",
    type: "자격증",
    size: 734_820,
    createdAt: addDays(today, -28),
    isUsed: true,
    downloadUrl: "#",
  },
  {
    id: "file-project-reference",
    fileName: "LOODI_프로젝트_소개서.pdf",
    type: "기타",
    size: 2_761_500,
    createdAt: addDays(today, -8),
    isUsed: false,
    downloadUrl: "#",
  },
];

export const externalLinkMockData: ExternalLink[] = [
  {
    id: "link-github",
    type: "GitHub",
    title: "GitHub 프로필",
    url: "https://github.com/example-career",
    description: "백엔드 프로젝트와 알고리즘 풀이 저장소를 모아둔 프로필입니다.",
    createdAt: addDays(today, -120),
  },
  {
    id: "link-notion-portfolio",
    type: "Notion",
    title: "Notion 포트폴리오",
    url: "https://notion.so/example-career-portfolio",
    description: "프로젝트별 역할, 성과, 회고를 정리한 지원용 포트폴리오입니다.",
    createdAt: addDays(today, -95),
  },
  {
    id: "link-velog",
    type: "Velog",
    title: "기술 블로그",
    url: "https://velog.io/@example-career",
    description: "Spring Boot, PostgreSQL, Next.js 학습 기록을 정리합니다.",
    createdAt: addDays(today, -80),
  },
  {
    id: "link-portfolio-site",
    type: "Portfolio",
    title: "개인 포트폴리오 사이트",
    url: "https://portfolio.example.com",
    description: "대표 프로젝트와 이력 요약을 빠르게 확인할 수 있는 사이트입니다.",
    createdAt: addDays(today, -45),
  },
  {
    id: "link-linkedin",
    type: "LinkedIn",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/example-career",
    description: "공개 프로필과 경력 요약을 관리합니다.",
    createdAt: addDays(today, -30),
  },
];
