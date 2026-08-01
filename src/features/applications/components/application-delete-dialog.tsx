"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

interface ApplicationDeleteDialogProps {
  companyName: string;
}

export function ApplicationDeleteDialog({ companyName }: ApplicationDeleteDialogProps) {
  const [open, setOpen] = useState(false);
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
                삭제 기능 준비 중
              </h2>
              <p className="text-body text-neutral-600" id={descriptionId}>
                {companyName} 지원 건 삭제는 실제 API 연동 단계에서 처리됩니다. 현재 화면에서는 데이터가 삭제되지 않습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)} variant="secondary">
                닫기
              </Button>
              <Button disabled variant="danger">
                삭제 예정
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
