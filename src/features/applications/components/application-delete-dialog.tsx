"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 px-6"
          role="dialog"
        >
          <div className="grid w-full max-w-md gap-4 rounded-modal border border-neutral-200 bg-neutral-0 p-5 shadow-lg">
            <div className="grid gap-2">
              <h2 className="text-h2 text-neutral-900" id={titleId}>
                지원 건 삭제
              </h2>
              <p className="text-body text-neutral-600" id={descriptionId}>
                {companyName} 지원 건을 삭제합니다. 삭제 후에는 목록에서 다시 확인할 수 없습니다.
              </p>
            </div>
            {errorMessage ? (
              <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
                {errorMessage}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button disabled={deleting} onClick={() => setOpen(false)} variant="secondary">
                닫기
              </Button>
              <Button loading={deleting} onClick={handleDelete} variant="danger">
                삭제
              </Button>
            </div>
          </div>
        </div>
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
