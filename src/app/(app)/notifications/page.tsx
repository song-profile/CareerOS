import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/features/notifications/components/notification-list";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        description="지원 마감, 일정, 자격 만료 알림을 확인하고 읽음 처리합니다."
        title="알림"
      />
      <NotificationList />
    </>
  );
}
