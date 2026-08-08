import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "info";

const toastToneClassName: Record<ToastTone, string> = {
  error: "border-danger-100 bg-danger-50 text-danger-700",
  info: "border-primary-100 bg-primary-50 text-primary-700",
  success: "border-success-100 bg-success-50 text-success-700",
};

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: ToastTone;
  widthClassName?: string;
}

export function Toast({
  children,
  className,
  role,
  tone = "info",
  widthClassName = "sm:w-[360px]",
  ...props
}: ToastProps) {
  const resolvedRole = role ?? (tone === "error" ? "alert" : "status");

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 right-6 z-50 rounded-card border px-4 py-3 text-body-medium shadow-lg sm:left-auto",
        toastToneClassName[tone],
        widthClassName,
        className,
      )}
      role={resolvedRole}
      {...props}
    >
      {children}
    </div>
  );
}
