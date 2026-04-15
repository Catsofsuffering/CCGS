import * as React from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "error" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "text-gray-400 border-gray-500/20 bg-gray-500/10",
  accent:  "text-accent border-accent/30 bg-accent-muted",
  success: "text-accent border-accent/30 bg-accent-muted",
  warning: "text-gray-300 border-gray-400/30 bg-gray-500/10",
  error:   "text-gray-200 border-gray-400/30 bg-gray-500/10",
  muted:   "text-gray-500 border-border bg-transparent",
};

export function Badge({ variant = "default", children, className = "", dot }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-live-pulse" />
      )}
      {children}
    </span>
  );
}
