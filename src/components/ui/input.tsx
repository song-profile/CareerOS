import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, errorMessage, helperText, id, label, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label className="text-body-medium text-neutral-900" htmlFor={inputId}>
            {label}
            {required ? <span className="ml-1 text-danger-600" aria-hidden="true">*</span> : null}
          </label>
        ) : null}
        <input
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? true : undefined}
          className={cn(
            "h-10 w-full rounded-control border bg-neutral-0 px-3 text-body text-neutral-900",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
            errorMessage ? "border-danger-600" : "border-neutral-200",
            className,
          )}
          disabled={disabled}
          id={inputId}
          required={required}
          {...props}
        />
        {helperText ? (
          <p className="text-caption text-neutral-600" id={helperId}>
            {helperText}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="text-caption text-danger-600" id={errorId}>
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
