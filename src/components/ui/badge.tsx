import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "danger"
  | "deadlineUrgent"
  | "deadlineSoon"
  | "deadlineWeek"
  | "deadlineUpcoming"
  | "statusDraft"
  | "statusSubmitted"
  | "statusInterview";

const variantClassName: Record<BadgeVariant, string> = {
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-600",
  primary: "border-primary-100 bg-primary-50 text-primary-700",
  success: "border-success-100 bg-success-50 text-success-700",
  danger: "border-danger-100 bg-danger-50 text-danger-700",
  deadlineUrgent: "border-red-100 bg-red-50 text-urgent-red",
  deadlineSoon: "border-orange-100 bg-orange-50 text-urgent-orange",
  deadlineWeek: "border-amber-100 bg-amber-50 text-urgent-amber",
  deadlineUpcoming: "border-blue-100 bg-blue-50 text-calm-blue",
  statusDraft: "border-yellow-100 bg-yellow-50 text-yellow-700",
  statusSubmitted: "border-blue-100 bg-blue-50 text-blue-700",
  statusInterview: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-badge border px-2 py-0.5 text-caption font-medium",
        variantClassName[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
