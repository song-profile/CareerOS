export interface NavigationItem {
  href: string;
  label: string;
  description: string;
  iconLabel: string;
}

export const APP_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    description: "오늘 확인할 일",
    iconLabel: "대",
  },
  {
    href: "/applications",
    label: "지원관리",
    description: "회사와 지원 건",
    iconLabel: "지",
  },
  {
    href: "/calendar",
    label: "캘린더",
    description: "마감과 일정",
    iconLabel: "캘",
  },
  {
    href: "/essays",
    label: "자소서",
    description: "답변과 제출본",
    iconLabel: "자",
  },
  {
    href: "/materials",
    label: "내 자료",
    description: "자격증과 파일",
    iconLabel: "내",
  },
];

export const SETTINGS_NAVIGATION_ITEM: NavigationItem = {
  href: "/settings",
  label: "설정",
  description: "환경 설정",
  iconLabel: "설",
};

export const ALL_NAVIGATION_ITEMS = [...APP_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEM];
