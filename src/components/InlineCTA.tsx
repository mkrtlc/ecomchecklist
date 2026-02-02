"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Star, Users, Zap } from "lucide-react";

interface InlineCTAProps {
  variant: "standard" | "social-proof" | "urgency";
  headline: string;
  subtext?: string;
  ctaText: string;
  stats?: {
    storesAudited?: number;
    rating?: number;
    resultTime?: string;
  };
  reportsLeft?: number;
  onCtaClick: () => void;
}

export function InlineCTA({
  variant,
  headline,
  subtext,
  ctaText,
  stats,
  reportsLeft = 7,
  onCtaClick,
}: InlineCTAProps) {
  // Variant 1: Standard - after Problem Agitation
  if (variant === "standard") {
    return (
      <section className="py-10 md:py-12 bg-white dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {headline}
                </h3>
                {subtext && (
                  <p className="text-slate-600 dark:text-slate-400">{subtext}</p>
                )}
              </div>
              <Button
                size="lg"
                onClick={onCtaClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold whitespace-nowrap shrink-0"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Social Proof - after What We Check
  if (variant === "social-proof") {
    return (
      <section className="py-10 md:py-12 bg-slate-100 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Stats Row */}
            {stats && (
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                {stats.storesAudited && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stats.storesAudited.toLocaleString()}+
                    </span>
                    <span className="text-slate-500">stores audited</span>
                  </div>
                )}
                {stats.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stats.rating}
                    </span>
                    <span className="text-slate-500">rating</span>
                  </div>
                )}
                {stats.resultTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stats.resultTime}
                    </span>
                    <span className="text-slate-500">results</span>
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {headline}
              </h3>
              {subtext && (
                <p className="text-slate-600 dark:text-slate-400 mb-6">{subtext}</p>
              )}
              <Button
                size="lg"
                onClick={onCtaClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Urgency - before Final CTA
  if (variant === "urgency") {
    return (
      <section className="py-10 md:py-12 bg-orange-50 dark:bg-orange-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border-2 border-orange-300 dark:border-orange-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {headline.replace("X", String(reportsLeft))}
                  </h3>
                  {subtext && (
                    <p className="text-slate-600 dark:text-slate-400">{subtext}</p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={onCtaClick}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold whitespace-nowrap shrink-0"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
