import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "border border-neutral-200 bg-neutral-0 text-neutral-900 hover:bg-neutral-100 focus-visible:ring-primary-500",
  ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-primary-500",
  danger: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-caption",
  md: "h-10 gap-2 px-4 text-body-medium",
  lg: "h-12 gap-2.5 px-5 text-body-medium",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      leadingIcon,
      size = "md",
      trailingIcon,
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-control font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClassName[variant],
          sizeClassName[size],
          className,
        )}
        disabled={isDisabled}
        type={type}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded-full border-2 border-current border-r-transparent"
          />
        ) : (
          leadingIcon
        )}
        <span>{children}</span>
        {!loading ? trailingIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
