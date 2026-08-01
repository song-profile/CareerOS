import type { SelectHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      disabled,
      errorMessage,
      helperText,
      id,
      label,
      options,
      placeholder,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const errorId = errorMessage ? `${selectId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label className="text-body-medium text-neutral-900" htmlFor={selectId}>
            {label}
            {required ? <span className="ml-1 text-danger-600" aria-hidden="true">*</span> : null}
          </label>
        ) : null}
        <select
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? true : undefined}
          className={cn(
            "h-10 w-full rounded-control border bg-neutral-0 px-3 text-body text-neutral-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
            errorMessage ? "border-danger-600" : "border-neutral-200",
            className,
          )}
          disabled={disabled}
          id={selectId}
          required={required}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
