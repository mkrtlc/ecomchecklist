"use client";

import { Check, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickWin {
  id: string;
  title: string;
  description: string;
  howToFix: string;
  difficulty: "easy" | "medium";
}

interface QuickWinsSectionProps {
  quickWins: QuickWin[];
  className?: string;
}

// Define which check IDs are quick wins that non-developers can fix
const QUICK_WIN_CHECK_IDS = new Set([
  "meta-tags",
  "trust-badges",
  "reviews-display",
  "return-policy",
  "shipping-info",
  "clear-pricing",
  "og-tags",
  "product-image-quality",
  "social-links",
  "contact-info",
]);

export function isQuickWinCheck(checkId: string): boolean {
  return QUICK_WIN_CHECK_IDS.has(checkId);
}

function QuickWinCard({ quickWin }: { quickWin: QuickWin }) {
  return (
    <div className="bg-white dark:bg-card rounded-lg border p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {quickWin.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            {quickWin.description}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                quickWin.difficulty === "easy"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              )}
            >
              {quickWin.difficulty === "easy" ? "Easy Fix" : "Moderate"}
            </span>
          </div>
        </div>
      </div>
      {quickWin.howToFix && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {quickWin.howToFix}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickWinsSection({
  quickWins,
  className,
}: QuickWinsSectionProps) {
  if (quickWins.length === 0) {
    return null;
  }

  // Show max 4 quick wins
  const displayWins = quickWins.slice(0, 4);

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
              Quick Wins
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Easy fixes you can do without a developer
            </p>
          </div>
        </div>
      </div>

      {/* Quick Win Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayWins.map((win) => (
            <QuickWinCard key={win.id} quickWin={win} />
          ))}
        </div>
      </div>

      {/* All Quick Wins Note */}
      {quickWins.length > 4 && (
        <div className="px-6 py-3 bg-green-100/50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>
              Plus {quickWins.length - 4} more quick wins available in the detailed results below
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
