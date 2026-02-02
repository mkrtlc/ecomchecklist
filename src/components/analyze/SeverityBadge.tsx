"use client";

import { cn } from "@/lib/utils";

export type Severity = "critical" | "high" | "medium" | "nice";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  critical: {
    label: "CRITICAL",
    bgColor: "bg-red-100 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
  },
  high: {
    label: "HIGH",
    bgColor: "bg-orange-100 dark:bg-orange-950/50",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  medium: {
    label: "MEDIUM",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/50",
    textColor: "text-yellow-700 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  nice: {
    label: "LOW",
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Status badge for pass/warn/fail
export type CheckStatus = "pass" | "warn" | "fail";

interface StatusBadgeProps {
  status: CheckStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  CheckStatus,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  pass: {
    label: "PASSED",
    bgColor: "bg-green-100 dark:bg-green-950/50",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
  },
  warn: {
    label: "WARNING",
    bgColor: "bg-amber-100 dark:bg-amber-950/50",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  fail: {
    label: "FAILED",
    bgColor: "bg-red-100 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Evidence pills component
interface EvidencePillsProps {
  evidence: string[];
  maxVisible?: number;
  className?: string;
}

export function EvidencePills({
  evidence,
  maxVisible = 3,
  className,
}: EvidencePillsProps) {
  const visible = evidence.slice(0, maxVisible);
  const remaining = evidence.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((item, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full max-w-[200px] truncate"
          title={item}
        >
          {item}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
