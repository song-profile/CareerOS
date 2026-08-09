"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateApplicationStatus } from "@/features/applications/api/application-api";
import { APPLICATION_STATUS_OPTIONS } from "@/features/applications/form-options";
import type { ApplicationStatus } from "@/features/applications/types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { reloadAfterMutation } from "@/lib/api/mutation";

interface ApplicationStatusUpdateFormProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function ApplicationStatusUpdateForm({
  applicationId,
  currentStatus,
}: ApplicationStatusUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  async function handleStatusUpdate() {
    if (saving || status === currentStatus) {
      return;
    }

    setSaving(true);
    setToastMessage("");

    try {
      await updateApplicationStatus(applicationId, status);
      setToastTone("success");
      setToastMessage("지원 상태를 변경했습니다.");
      reloadAfterMutation(router);
    } catch (error) {
      setToastTone("error");
      setToastMessage(getApiErrorMessage(error, "지원 상태를 변경"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-control border border-neutral-200 bg-neutral-50 p-3">
      <Select
        label="상태 변경"
        onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
        options={APPLICATION_STATUS_OPTIONS}
        value={status}
      />
      <Button
        disabled={status === currentStatus}
        loading={saving}
        onClick={handleStatusUpdate}
        size="sm"
      >
        상태 저장
      </Button>
      {toastMessage ? (
        <p className={toastTone === "success" ? "text-caption text-success-700" : "text-caption text-danger-700"}>
          {toastMessage}
        </p>
      ) : null}
    </div>
  );
}
