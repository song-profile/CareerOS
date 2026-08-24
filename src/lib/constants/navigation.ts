export type NavigationIconName =
  | "dashboard"
  | "applications"
  | "calendar"
  | "essays"
  | "materials"
  | "settings";

export interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: NavigationIconName;
}

export const APP_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    description: "오늘 확인할 일",
    icon: "dashboard",
  },
  {
    href: "/applications",
    label: "지원관리",
    description: "회사와 지원 건",
    icon: "applications",
  },
  {
    href: "/calendar",
    label: "캘린더",
    description: "마감과 일정",
    icon: "calendar",
  },
  {
    href: "/essays",
    label: "자소서",
    description: "답변과 제출본",
    icon: "essays",
  },
  {
    href: "/materials",
    label: "내 자료",
    description: "자격증과 파일",
    icon: "materials",
  },
];

export const SETTINGS_NAVIGATION_ITEM: NavigationItem = {
  href: "/settings",
  label: "설정",
  description: "환경 설정",
  icon: "settings",
};

export const ALL_NAVIGATION_ITEMS = [...APP_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEM];
