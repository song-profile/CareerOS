import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "highlight";

const cardVariantClassName: Record<CardVariant, string> = {
  default: "border-neutral-200/80 bg-white/95 shadow-[0_1px_2px_rgba(31,29,26,0.035)]",
  highlight: "border-primary-100 bg-primary-50/80 shadow-[0_1px_2px_rgba(31,29,26,0.035)]",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <section
      className={cn("rounded-card border", cardVariantClassName[variant], className)}
      {...props}
    />
  );
}

export interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CardVariant;
}

export const CardButton = forwardRef<HTMLButtonElement, CardButtonProps>(
  ({ className, type = "button", variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "w-full rounded-card border text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "default" ? "hover:border-neutral-400/60 hover:bg-white" : "hover:bg-primary-100/70",
          cardVariantClassName[variant],
          className,
        )}
        type={type}
        {...props}
      />
    );
  },
);

CardButton.displayName = "CardButton";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-neutral-200/80 p-4", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-neutral-200/80 p-4", className)} {...props} />;
}
