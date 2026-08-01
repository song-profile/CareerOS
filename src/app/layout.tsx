import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerDock",
  description: "취업 준비의 모든 자료와 일정을 한곳에서 관리하세요.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
