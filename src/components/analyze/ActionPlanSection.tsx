"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  Calendar,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge, EvidencePills } from "./SeverityBadge";
import type { Severity } from "./SeverityBadge";

interface ActionItem {
  id: string;
  title: string;
  severity: Severity;
  status: "pass" | "warn" | "fail";
  evidence?: string[];
  howToFix?: string;
  whyImportant?: string;
  category: string;
}

interface ActionPlan {
  immediate: ActionItem[];
  shortTerm: ActionItem[];
  longTerm: ActionItem[];
}

interface ActionPlanSectionProps {
  actionPlan: ActionPlan;
  className?: string;
}

type TabKey = "immediate" | "shortTerm" | "longTerm";

const TAB_CONFIG: Record<
  TabKey,
  { label: string; shortLabel: string; icon: React.ElementType; description: string }
> = {
  immediate: {
    label: "Immediate",
    shortLabel: "This Week",
    icon: AlertTriangle,
    description: "Critical issues that need immediate attention",
  },
  shortTerm: {
    label: "Short-term",
    shortLabel: "This Month",
    icon: Clock,
    description: "High priority items to address soon",
  },
  longTerm: {
    label: "Long-term",
    shortLabel: "When Possible",
    icon: Calendar,
    description: "Nice-to-have improvements",
  },
};

function ActionItemCard({ item }: { item: ActionItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <SeverityBadge severity={item.severity} />
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded capitalize">
                {item.category}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {item.title}
            </h4>
            {item.evidence && item.evidence.length > 0 && (
              <div className="mt-2">
                <EvidencePills evidence={item.evidence} maxVisible={2} />
              </div>
            )}
          </div>
          <div className="flex-shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (item.howToFix || item.whyImportant) && (
        <div className="px-4 pb-4 border-t bg-gray-50/50 dark:bg-muted/20">
          {item.whyImportant && (
            <div className="pt-4">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Why It Matters
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {item.whyImportant}
              </p>
            </div>
          )}
          {item.howToFix && (
            <div className="pt-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                    How to Fix
                  </h5>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {item.howToFix}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const config = TAB_CONFIG[tab];
  const Icon = config.icon;
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>
      <p className="text-muted-foreground">
        No {config.label.toLowerCase()} issues found!
      </p>
    </div>
  );
}

export function ActionPlanSection({
  actionPlan,
  className,
}: ActionPlanSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("immediate");

  const tabs: TabKey[] = ["immediate", "shortTerm", "longTerm"];
  const activeItems = actionPlan[activeTab];

  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-lg">Your Action Plan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Prioritized fixes based on business impact
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => {
            const config = TAB_CONFIG[tab];
            const count = actionPlan[tab].length;
            const Icon = config.icon;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.shortLabel}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full",
                      isActive
                        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeItems.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-3">
            {activeItems.map((item) => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
