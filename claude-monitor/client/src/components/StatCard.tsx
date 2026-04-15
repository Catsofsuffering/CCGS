/**
 * @file StatCard.tsx
 * @description Minimal stat display — label + large value + icon. No card border.
 */

import type { LucideIcon } from "lucide-react";
import { Tip } from "./Tip";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accentColor?: string;
  raw?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = "text-accent",
  raw,
}: StatCardProps) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <Icon className={`w-4 h-4 flex-shrink-0 ${accentColor}`} />
      </div>
      <div className="flex items-end gap-2 min-w-0">
        <Tip raw={raw}>
          <span className="text-xl font-semibold text-gray-100 truncate">{value}</span>
        </Tip>
        {trend && <span className="text-xs text-gray-500 mb-0.5 flex-shrink-0">{trend}</span>}
      </div>
    </div>
  );
}
