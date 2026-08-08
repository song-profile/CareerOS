"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { removeCredential } from "@/features/materials/materials-service";

interface CredentialDeleteButtonProps {
  credentialId: string;
  credentialName: string;
}

export function CredentialDeleteButton({
  credentialId,
  credentialName,
}: CredentialDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleDelete() {
    setDeleting(true);
    const result = await removeCredential(credentialId);
    setDeleting(false);

    if (!result.ok) {
      setNotice(result.message);
      setOpen(false);
      return;
    }

    router.push("/materials/credentials");
    router.refresh();
  }

  return (
    <>
      <Button
        className="w-full sm:w-fit"
        disabled={deleting}
        onClick={() => setOpen(true)}
        size="sm"
        variant="danger"
      >
        삭제
      </Button>
      <ConfirmDialog
        confirmLabel={deleting ? "삭제 중" : "삭제"}
        description={
          <p className="break-words">
            {credentialName} 자격 정보를 삭제합니다. 지원 건에 연결된 자격이면 서버에서 거절될 수 있습니다.
          </p>
        }
        destructive
        onCancel={() => setOpen(false)}
        onConfirm={() => void handleDelete()}
        open={open}
        title="자격 삭제"
      />
      {notice ? <Toast tone="error">{notice}</Toast> : null}
    </>
  );
}
