import { cn } from "@/lib/utils/cn";

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      aria-busy="true"
      aria-label="불러오는 중"
      className={cn("rounded-control bg-neutral-100", className)}
      role="status"
    />
  );
}
