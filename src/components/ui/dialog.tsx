"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open?: boolean;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  labelledById?: string;
  className?: string;
}

export function Dialog({
  children,
  className,
  description,
  footer,
  labelledById,
  onClose,
  open = true,
  title,
}: DialogProps) {
  const generatedTitleId = useId();
  const titleId = labelledById ?? generatedTitleId;

  useEffect(() => {
    if (!open || !onClose) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 px-6"
      role="dialog"
    >
      <div className={cn("grid w-full max-w-md gap-4 rounded-modal border border-neutral-200 bg-neutral-0 p-5 shadow-lg", className)}>
        <div className="grid gap-2">
          <h2 className="text-h2 text-neutral-900" id={titleId}>
            {title}
          </h2>
          {description ? <div className="text-body text-neutral-600">{description}</div> : null}
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  cancelLabel = "취소",
  confirmLabel,
  description,
  destructive = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog
      description={description}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} onClick={onConfirm} variant={destructive ? "danger" : "primary"}>
            {confirmLabel}
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      title={title}
    />
  );
}
