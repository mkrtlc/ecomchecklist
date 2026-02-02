"use client";

import { AlertTriangle, TrendingDown, ShieldAlert, Heart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessImpactSummary {
  totalIssues: number;
  criticalIssues: number;
  conversionIssues: number;
  trustIssues: number;
  estimatedRevenueAtRisk: "high" | "medium" | "low";
  topPriorities: string[];
}

interface BusinessImpactCardProps {
  impact: BusinessImpactSummary;
  className?: string;
}

const RISK_CONFIG: Record<
  "high" | "medium" | "low",
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  high: {
    label: "HIGH RISK",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    icon: AlertTriangle,
  },
  medium: {
    label: "MEDIUM RISK",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    icon: TrendingDown,
  },
  low: {
    label: "LOW RISK",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    icon: Heart,
  },
};

export function BusinessImpactCard({ impact, className }: BusinessImpactCardProps) {
  const riskConfig = RISK_CONFIG[impact.estimatedRevenueAtRisk];
  const RiskIcon = riskConfig.icon;

  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-lg">Business Impact</h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium",
            riskConfig.bgColor,
            riskConfig.color
          )}
        >
          <RiskIcon className="w-4 h-4" />
          <span>{riskConfig.label}</span>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Critical Issues */}
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-100 dark:border-red-900">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                Critical
              </span>
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {impact.criticalIssues}
            </div>
          </div>

          {/* Conversion Issues */}
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 text-center border border-orange-100 dark:border-orange-900">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                Conversion
              </span>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {impact.conversionIssues}
            </div>
          </div>

          {/* Trust Issues */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-center border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Trust
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {impact.trustIssues}
            </div>
          </div>
        </div>

        {/* Revenue Impact Message */}
        {impact.estimatedRevenueAtRisk === "high" && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Significant Revenue at Risk
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Critical issues are directly impacting your ability to convert visitors into customers.
                </p>
              </div>
            </div>
          </div>
        )}

        {impact.estimatedRevenueAtRisk === "medium" && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Moderate Revenue Impact
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                  Some issues may be affecting your conversion rate and customer trust.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Priorities */}
        {impact.topPriorities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Top Priorities
            </h4>
            <ol className="space-y-1">
              {impact.topPriorities.slice(0, 5).map((priority, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {priority}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
