import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type LinkButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type LinkButtonSize = "sm" | "md" | "lg";

const variantClassName: Record<LinkButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "border border-neutral-200 bg-neutral-0 text-neutral-900 hover:bg-neutral-100 focus-visible:ring-primary-500",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-primary-500",
  danger: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600",
};

const sizeClassName: Record<LinkButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-caption",
  md: "h-10 gap-2 px-4 text-body-medium",
  lg: "h-12 gap-2.5 px-5 text-body-medium",
};

interface LinkButtonProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  children: ReactNode;
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
}

export function LinkButton({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-control font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0",
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
