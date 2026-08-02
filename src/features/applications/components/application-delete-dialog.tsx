"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteApplication } from "@/features/applications/api/application-api";
import { ApiClientError } from "@/lib/api/client";

interface ApplicationDeleteDialogProps {
  applicationId: string;
  companyName: string;
}

export function ApplicationDeleteDialog({ applicationId, companyName }: ApplicationDeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    try {
      await deleteApplication(applicationId);
      router.replace("/applications?deleted=1");
      router.refresh();
    } catch (error) {
      setErrorMessage(getDeleteErrorMessage(error));
      setDeleting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="danger">
        삭제
      </Button>

      {open ? (
        <Dialog
          description={`${companyName} 지원 건을 삭제합니다. 삭제 후에는 목록에서 다시 확인할 수 없습니다.`}
          footer={
            <div className="flex justify-end gap-2">
              <Button disabled={deleting} onClick={() => setOpen(false)} variant="secondary">
                닫기
              </Button>
              <Button loading={deleting} onClick={handleDelete} variant="danger">
                삭제
              </Button>
            </div>
          }
          onClose={() => setOpen(false)}
          title="지원 건 삭제"
        >
            {errorMessage ? (
              <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
                {errorMessage}
              </p>
            ) : null}
        </Dialog>
      ) : null}
    </>
  );
}

function getDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "지원 건을 삭제할 수 없습니다. 잠시 후 다시 시도해 주세요.";
}
