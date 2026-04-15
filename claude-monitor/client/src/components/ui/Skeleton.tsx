interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-3 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
