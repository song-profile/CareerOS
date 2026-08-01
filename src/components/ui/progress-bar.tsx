import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
}

export function ProgressBar({ className, label, value }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption text-neutral-600">{label}</span>
        <span className="font-mono text-mono text-neutral-900">{safeValue}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="h-2 rounded-full bg-neutral-100"
        role="progressbar"
      >
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
