"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import {
  connectGoogleCalendar,
  createGoogleCalendarTestEvent,
  disconnectGoogleCalendar,
  fetchGoogleCalendarStatus,
  syncGoogleCalendar,
} from "@/features/calendar/api/calendar-api";
import type { CalendarStatusResponseDto } from "@/features/calendar/api/dto";
import type { CalendarSyncStatus } from "@/features/calendar/types";
import { createApiUrl } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getApiClientErrorMessage } from "@/lib/api/error-message";

type Action = "connect" | "sync" | "disconnect" | "test";

interface GoogleCalendarSettingsProps {
  callbackResult?: "success" | "failure";
  callbackReason?: string;
}

const syncStatusLabel: Record<CalendarSyncStatus, string> = {
  FAILED: "동기화 실패",
  NOT_CONNECTED: "연결 전",
  PENDING: "연결 준비 중",
  SYNCED: "동기화됨",
};

const callbackReasonLabel: Record<string, string> = {
  CONNECT_FAILED: "Google Calendar 연결을 완료하지 못했습니다.",
  GOOGLE_API_ERROR: "Google Calendar API 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  GOOGLE_AUTH_DENIED: "Google Calendar 권한 동의가 취소되었거나 계정 정책에서 차단되었습니다.",
  GOOGLE_CALENDAR_API_DISABLED: "Google Calendar API가 비활성화되어 있습니다. Google Cloud Console에서 Google Calendar API를 활성화해 주세요.",
  GOOGLE_CALENDAR_FORBIDDEN: "Google Calendar 접근이 차단되었습니다. 학교/조직 계정 정책 또는 Calendar 권한 허용 상태를 확인해 주세요.",
  GOOGLE_TOKEN_EXCHANGE_FAILED: "Google OAuth 토큰 발급에 실패했습니다. 다시 시도하거나 계정 정책을 확인해 주세요.",
  INVALID_REQUEST: "연결 요청 검증에 실패했습니다. 다시 시도해 주세요.",
  NO_REFRESH_TOKEN: "재동기화에 필요한 권한이 발급되지 않았습니다. 다시 동의해 주세요.",
};

export function GoogleCalendarSettings({
  callbackReason,
  callbackResult,
}: GoogleCalendarSettingsProps) {
  const calendarRedirectUri = useMemo(() => createApiUrl(apiEndpoints.calendar.oauthCallback), []);
  const [status, setStatus] = useState<CalendarStatusResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const callbackNotice = useMemo(() => {
    if (callbackResult === "success") {
      return { tone: "success" as const, message: "Google Calendar 연결이 완료되었습니다." };
    }

    if (callbackResult === "failure") {
      return {
        tone: "error" as const,
        message:
          (callbackReason ? callbackReasonLabel[callbackReason] : undefined) ??
          "Google Calendar 연결에 실패했습니다.",
      };
    }

    return null;
  }, [callbackReason, callbackResult]);

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    setErrorMessage("");
    try {
      setStatus(await fetchGoogleCalendarStatus());
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "Google Calendar 상태를 불러올 수 없습니다."));
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    setActiveAction("connect");
    setErrorMessage("");
    try {
      const response = await connectGoogleCalendar();
      window.location.assign(response.authorizationUrl);
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "Google Calendar 연결을 시작할 수 없습니다."));
      setActiveAction(null);
    }
  }

  async function handleSync() {
    setActiveAction("sync");
    setErrorMessage("");
    try {
      const result = await syncGoogleCalendar();
      setNotice(
        `재동기화 완료: 시도 ${result.attempted}건, 성공 ${result.synced}건, 실패 ${result.failed}건`,
      );
      await loadStatus();
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "Google Calendar 재동기화에 실패했습니다."));
    } finally {
      setActiveAction(null);
    }
  }

  async function handleTestEvent() {
    setActiveAction("test");
    setErrorMessage("");
    try {
      const result = await createGoogleCalendarTestEvent();
      setNotice(
        result.htmlLink
          ? "Google Calendar 테스트 이벤트를 생성했습니다."
          : `Google Calendar 테스트 이벤트를 생성했습니다. ID: ${result.googleEventId}`,
      );
      await loadStatus();
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "테스트 이벤트 생성에 실패했습니다."));
    } finally {
      setActiveAction(null);
    }
  }

  async function handleDisconnect() {
    setActiveAction("disconnect");
    setErrorMessage("");
    try {
      await disconnectGoogleCalendar();
      setDisconnectOpen(false);
      setNotice("Google Calendar 연결을 해제했습니다.");
      await loadStatus();
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "Google Calendar 연결 해제에 실패했습니다."));
    } finally {
      setActiveAction(null);
    }
  }

  const connected = status?.connected ?? false;
  const currentStatus = status?.status ?? "NOT_CONNECTED";

  return (
    <div className="grid gap-4">
      {callbackNotice ? (
        <Card
          className={callbackNotice.tone === "success" ? "border-success-100 bg-success-50" : "border-danger-100 bg-danger-50"}
          role={callbackNotice.tone === "error" ? "alert" : "status"}
        >
          <CardContent>
            <p className={callbackNotice.tone === "success" ? "text-body-medium text-success-700" : "text-body-medium text-danger-700"}>
              {callbackNotice.message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card aria-busy={loading}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-1">
              <h2 className="text-h2 text-neutral-900">Google Calendar</h2>
              <p className="text-body text-neutral-600">
                CareerDock이 만든 전용 캘린더에 내부 일정을 생성, 수정, 삭제합니다.
              </p>
            </div>
            <Badge variant={connected ? (currentStatus === "FAILED" ? "danger" : "success") : "neutral"}>
              {syncStatusLabel[currentStatus]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5">
            <div className="grid gap-3 rounded-control border border-neutral-200 p-4">
              <StatusRow label="연결 상태" value={connected ? "연결됨" : "연결되지 않음"} />
              <StatusRow label="연결 시각" value={formatNullableDate(status?.connectedAt)} />
              <StatusRow label="마지막 동기화" value={formatNullableDate(status?.lastSyncedAt)} />
              <StatusRow label="마지막 오류" value={status?.lastSyncError ?? "없음"} />
            </div>

            <div className="grid gap-2 rounded-control border border-neutral-200 p-4">
              <p className="text-body-medium text-neutral-900">일정 상태</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {(["NOT_CONNECTED", "PENDING", "SYNCED", "FAILED"] as CalendarSyncStatus[]).map((item) => (
                  <div className="rounded-control bg-neutral-50 p-3" key={item}>
                    <p className="text-caption text-neutral-600">{syncStatusLabel[item]}</p>
                    <p className="text-h3 text-neutral-900">{status?.eventCounts[item] ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-body text-danger-700" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                disabled={activeAction !== null}
                loading={activeAction === "connect"}
                onClick={handleConnect}
              >
                {connected ? "다시 연결" : "Calendar 연결"}
              </Button>
              <Button
                disabled={!connected || activeAction !== null}
                loading={activeAction === "sync"}
                onClick={handleSync}
                variant="secondary"
              >
                재동기화
              </Button>
              <Button
                disabled={!connected || activeAction !== null}
                loading={activeAction === "test"}
                onClick={handleTestEvent}
                variant="secondary"
              >
                테스트 이벤트
              </Button>
              <Button
                disabled={!connected || activeAction !== null}
                onClick={() => setDisconnectOpen(true)}
                variant="danger"
              >
                연결 해제
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid gap-2 text-body text-neutral-600">
            <p className="text-body-medium text-neutral-900">동기화 정책</p>
            <p>Google 로그인만으로는 Calendar 권한을 요청하지 않습니다. 이 화면의 연결 버튼을 누를 때만 추가 동의를 요청합니다.</p>
            <p>CareerDock은 사용자의 기본 캘린더 전체를 임의로 수정하지 않고, CareerDock 전용 Google Calendar에 만든 이벤트만 갱신합니다.</p>
            <p>연결 해제 시 저장된 연결 정보와 동기화 ID를 제거하고, Google 토큰 revoke를 best-effort로 시도합니다.</p>
            <div className="mt-2 grid gap-1 rounded-control border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-caption text-neutral-600">Google Cloud Console에 추가할 Calendar 승인된 리디렉션 URI</p>
              <code className="break-all rounded-control bg-neutral-0 px-2 py-1 text-caption text-neutral-900">
                {calendarRedirectUri}
              </code>
              <p className="text-caption text-neutral-500">
                `redirect_uri_mismatch`가 뜨면 위 URI가 OAuth Client의 Authorized redirect URIs에 빠진 상태입니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {disconnectOpen ? (
        <Dialog
          description="연결을 해제하면 이후 일정은 Google Calendar로 자동 반영되지 않습니다. 기존 CareerDock 일정은 삭제되지 않습니다."
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={activeAction === "disconnect"}
                onClick={() => setDisconnectOpen(false)}
                variant="secondary"
              >
                취소
              </Button>
              <Button
                loading={activeAction === "disconnect"}
                onClick={handleDisconnect}
                variant="danger"
              >
                연결 해제
              </Button>
            </div>
          }
          onClose={() => setDisconnectOpen(false)}
          open
          title="Google Calendar 연결을 해제할까요?"
        />
      ) : null}

      {notice ? (
        <Toast tone="success" widthClassName="sm:w-[440px]">
          {notice}
        </Toast>
      ) : null}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)]">
      <span className="text-caption text-neutral-600">{label}</span>
      <span className="break-words text-body text-neutral-900">{value}</span>
    </div>
  );
}

function formatNullableDate(value: string | null | undefined): string {
  if (!value) {
    return "없음";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
