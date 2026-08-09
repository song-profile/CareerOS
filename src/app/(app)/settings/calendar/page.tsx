import { PageHeader } from "@/components/layout/page-header";
import { GoogleCalendarSettings } from "@/features/calendar/components/google-calendar-settings";

interface CalendarSettingsPageProps {
  searchParams?: Promise<{
    connected?: string;
    reason?: string;
  }>;
}

export default async function CalendarSettingsPage({
  searchParams,
}: CalendarSettingsPageProps) {
  const params = searchParams ? await searchParams : {};
  const callbackResult =
    params.connected === "true"
      ? "success"
      : params.connected === "false"
        ? "failure"
        : undefined;

  return (
    <>
      <PageHeader
        description="CareerDock 내부 일정을 사용자의 Google Calendar와 선택적으로 동기화합니다."
        title="Google Calendar 연동"
      />
      <GoogleCalendarSettings
        callbackReason={params.reason}
        callbackResult={callbackResult}
      />
    </>
  );
}
