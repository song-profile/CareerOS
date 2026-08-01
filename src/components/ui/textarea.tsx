import type { TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaResize = "none" | "vertical" | "horizontal";

const resizeClassName: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  resize?: TextareaResize;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      disabled,
      errorMessage,
      helperText,
      id,
      label,
      required,
      resize = "vertical",
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = errorMessage ? `${textareaId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label className="text-body-medium text-neutral-900" htmlFor={textareaId}>
            {label}
            {required ? <span className="ml-1 text-danger-600" aria-hidden="true">*</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? true : undefined}
          className={cn(
            "min-h-28 w-full rounded-control border bg-neutral-0 px-3 py-2 text-body text-neutral-900",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
            errorMessage ? "border-danger-600" : "border-neutral-200",
            resizeClassName[resize],
            className,
          )}
          disabled={disabled}
          id={textareaId}
          required={required}
          rows={rows}
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

Textarea.displayName = "Textarea";
