import { cn } from "@/lib/utils/cn";

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cn("rounded-control bg-neutral-100", className)} />;
}
