"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  Zap,
  Shield,
  TrendingUp,
  Download,
  Share2,
  RefreshCw,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import type { AuditCategoryId, AuditCheckDefinition, AuditCheckResult, CheckStatus } from "@/lib/audit";
import {
  compareToBenchmark,
  computeAuditScore,
  createRegistry,
  downloadAuditReportPdf,
  getIndustryBenchmark,
  resolveAuditRun,
} from "@/lib/audit";
import {
  WebsitePreview,
  BusinessImpactCard,
  ActionPlanSection,
  QuickWinsSection,
  SeverityBadge,
  EvidencePills,
  isQuickWinCheck,
} from "@/components/analyze";
import type { Severity } from "@/components/analyze";

// Types
interface CheckItem {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  description: string;
  recommendation?: string;
  severity?: Severity;
  evidence?: string[];
  whyImportant?: string;
  howToFix?: string;
}

interface Category {
  id: AuditCategoryId;
  name: string;
  icon: React.ElementType;
  score: number;
  items: CheckItem[];
}

// API Response Types
interface AuditStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentCheck?: string;
  overallScore?: number;
  errorMessage?: string;
}

interface BusinessImpactData {
  totalIssues: number;
  criticalIssues: number;
  conversionIssues: number;
  trustIssues: number;
  estimatedRevenueAtRisk: 'high' | 'medium' | 'low';
  topPriorities: string[];
  actionPlan: {
    immediate: Array<{ checkId: string; impactScore: number }>;
    shortTerm: Array<{ checkId: string; impactScore: number }>;
    longTerm: Array<{ checkId: string; impactScore: number }>;
  };
}

interface AuditResultsResponse {
  id: string;
  url: string;
  status: string;
  platform?: string;
  screenshotUrl?: string;
  auditedAt: string;
  overallScore: number;
  grade: string;
  categoryScores: Array<{
    category: string;
    label: string;
    score: number;
    grade: string;
    passed: number;
    warned: number;
    failed: number;
    total: number;
  }>;
  checks: Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    status: 'pass' | 'warn' | 'fail';
    evidence?: string[];
    urlsTested?: string[];
    whyImportant?: string;
    howToFix?: string;
  }>;
  summary: {
    total: number;
    passed: number;
    warned: number;
    failed: number;
  };
  businessImpact?: BusinessImpactData;
}

// Category display names and icons
const CATEGORY_CONFIG: Record<string, { name: string; icon: React.ElementType }> = {
  seo: { name: "SEO Analysis", icon: Search },
  performance: { name: "Performance", icon: Zap },
  security: { name: "Security & Trust", icon: Shield },
  conversion: { name: "Conversion", icon: TrendingUp },
  ux: { name: "User Experience", icon: Globe },
  technical: { name: "Technical", icon: Zap },
  accessibility: { name: "Accessibility", icon: CheckCircle },
  content: { name: "Content", icon: Search },
  analytics: { name: "Analytics", icon: TrendingUp },
  other: { name: "Other", icon: CheckCircle },
};

// Components
function ScoreRing({ score, size = "large" }: { score: number; size?: "small" | "large" }) {
  const radius = size === "large" ? 70 : 30;
  const strokeWidth = size === "large" ? 10 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className={`transform -rotate-90 ${size === "large" ? "w-40 h-40" : "w-16 h-16"}`}
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
      >
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke={getStrokeColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${size === "large" ? "text-4xl" : "text-lg"} font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        {size === "large" && <span className="text-sm text-muted-foreground">/100</span>}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "pass" | "fail" | "warning" }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "fail":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
}

function CategoryCard({ category, isExpanded, onToggle }: {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const passCount = category.items.filter((i) => i.status === "pass").length;
  const failCount = category.items.filter((i) => i.status === "fail").length;
  const warningCount = category.items.filter((i) => i.status === "warning").length;

  return (
    <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <category.icon className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> {passCount}
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> {warningCount}
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" /> {failCount}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ScoreRing score={category.score} size="small" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t px-6 pb-6">
          <div className="divide-y">
            {category.items.map((item) => (
              <div key={item.id} className="py-4">
                <div className="flex items-start gap-3">
                  <StatusIcon status={item.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">{item.name}</span>
                      {item.severity && item.status !== "pass" && (
                        <SeverityBadge severity={item.severity} />
                      )}
                    </div>
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="mt-2">
                        <EvidencePills evidence={item.evidence} maxVisible={3} />
                      </div>
                    )}
                    {item.whyImportant && (
                      <p className="text-sm text-muted-foreground mt-2">{item.whyImportant}</p>
                    )}
                    {item.recommendation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800 dark:text-blue-300">{item.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Progress/Loading component
function AuditProgress({ status, progress, currentCheck }: {
  status: string;
  progress: number;
  currentCheck?: string;
}) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-green-500"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: 2 * Math.PI * 40,
                strokeDashoffset: 2 * Math.PI * 40 * (1 - progress / 100),
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {status === 'pending' ? 'Starting Audit...' : 'Analyzing Your Store'}
        </h2>

        {currentCheck && (
          <p className="text-muted-foreground mb-4">
            Currently checking: <span className="font-medium">{currentCheck}</span>
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>This usually takes 30-60 seconds</span>
        </div>
      </div>
    </main>
  );
}

// Error component
function AuditError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Audit Failed</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

// Results display component
function AuditResults({ results }: { results: AuditResultsResponse }) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Convert API results to Category format
  const categories: Category[] = results.categoryScores.map(catScore => {
    const config = CATEGORY_CONFIG[catScore.category] || CATEGORY_CONFIG.other;
    const categoryChecks = results.checks.filter(c => c.category === catScore.category);

    return {
      id: catScore.category as AuditCategoryId,
      name: catScore.label || config.name,
      icon: config.icon,
      score: catScore.score,
      items: categoryChecks.map(check => ({
        id: check.id,
        name: check.title,
        status: check.status === 'warn' ? 'warning' : check.status,
        description: check.evidence?.join(' ') || check.whyImportant || 'No details available',
        recommendation: check.status !== 'pass' ? check.howToFix : undefined,
        severity: check.severity as Severity,
        evidence: check.evidence,
        whyImportant: check.whyImportant,
        howToFix: check.howToFix,
      })),
    };
  });

  // Build action plan items for ActionPlanSection
  const buildActionPlanItems = () => {
    if (!results.businessImpact?.actionPlan) {
      return { immediate: [], shortTerm: [], longTerm: [] };
    }

    const mapActionItems = (items: Array<{ checkId: string }>) => {
      return items.map(item => {
        const check = results.checks.find(c => c.id === item.checkId);
        return {
          id: item.checkId,
          title: check?.title || item.checkId,
          severity: (check?.severity || 'medium') as Severity,
          status: (check?.status || 'fail') as 'pass' | 'warn' | 'fail',
          evidence: check?.evidence,
          howToFix: check?.howToFix,
          whyImportant: check?.whyImportant,
          category: check?.category || 'other',
        };
      });
    };

    return {
      immediate: mapActionItems(results.businessImpact.actionPlan.immediate),
      shortTerm: mapActionItems(results.businessImpact.actionPlan.shortTerm),
      longTerm: mapActionItems(results.businessImpact.actionPlan.longTerm),
    };
  };

  // Build quick wins list
  const quickWins = results.checks
    .filter(check => check.status !== 'pass' && isQuickWinCheck(check.id))
    .slice(0, 4)
    .map(check => ({
      id: check.id,
      title: check.title,
      description: check.whyImportant || 'This issue may be affecting your store performance.',
      howToFix: check.howToFix || '',
      difficulty: 'easy' as const,
    }));

  // Auto-expand first category with failures
  useEffect(() => {
    const firstFailCategory = categories.find(cat =>
      cat.items.some(item => item.status === 'fail')
    );
    if (firstFailCategory) {
      setExpandedCategories([firstFailCategory.id]);
    } else if (categories.length > 0) {
      setExpandedCategories([categories[0].id]);
    }
  }, []);

  // Create audit data for PDF export
  const definitions: AuditCheckDefinition[] = results.checks.map(check => ({
    id: check.id,
    title: check.title,
    category: check.category as AuditCategoryId,
    severity: check.severity as 'critical' | 'high' | 'medium' | 'nice',
    whyImportant: check.whyImportant || '',
    howToFix: check.howToFix || '',
  }));

  const checkResults: AuditCheckResult[] = results.checks.map(check => ({
    checkId: check.id,
    status: check.status as CheckStatus,
    evidence: check.evidence,
    urlsTested: check.urlsTested,
  }));

  const run = {
    url: results.url,
    auditedAt: results.auditedAt,
    checks: checkResults,
  };

  const registry = createRegistry(definitions);
  const resolvedChecks = resolveAuditRun(run, registry);
  const score = computeAuditScore({ definitions, results: checkResults });
  const benchmark = getIndustryBenchmark();
  const benchmarkComparison = compareToBenchmark({ yourScore0to100: results.overallScore, benchmark });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Needs Work";
    return "Poor";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const displayUrl = results.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const actionPlan = buildActionPlanItems();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await downloadAuditReportPdf({
                    run,
                    score,
                    resolvedChecks,
                    benchmark,
                    filename: `ecommerce-audit-${displayUrl}.pdf`,
                  });
                }}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Screenshot + Score */}
      <section className="bg-gradient-to-b from-green-50 to-gray-50 dark:from-green-950/20 dark:to-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Website Preview + Score Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Website Preview */}
              <WebsitePreview
                url={results.url}
                screenshotUrl={results.screenshotUrl}
                platform={results.platform}
              />

              {/* Score Card */}
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-6 flex flex-col items-center justify-center">
                <ScoreRing score={results.overallScore} size="large" />
                <div className="mt-4 text-center">
                  <h1 className="text-2xl font-bold">
                    Your Score:{" "}
                    <span className={getScoreColor(results.overallScore)}>{getScoreLabel(results.overallScore)}</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Grade: <span className="font-semibold">{results.grade}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {benchmarkComparison.label} vs industry average ({benchmark.industryAvgScore0to100})
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
                    <Clock className="w-4 h-4" />
                    <span>Analyzed {new Date(results.auditedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-green-600">{results.summary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-amber-600">{results.summary.warned}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact + Action Plan Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Impact Card */}
              {results.businessImpact && (
                <BusinessImpactCard impact={results.businessImpact} />
              )}

              {/* Action Plan Section */}
              <ActionPlanSection actionPlan={actionPlan} />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Wins Section */}
      {quickWins.length > 0 && (
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <QuickWinsSection quickWins={quickWins} />
            </div>
          </div>
        </section>
      )}

      {/* Detailed Results Section */}
      <section className="py-8 border-t bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Detailed Results</h2>
            <p className="text-muted-foreground mb-6">
              We analyzed {results.summary.total} checkpoints across {categories.length} categories.
            </p>
            <div className="space-y-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.includes(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-green-600 dark:bg-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Improve Your Store?
          </h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Download the full PDF report with detailed recommendations for each issue.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              variant="secondary"
              onClick={async () => {
                await downloadAuditReportPdf({
                  run,
                  score,
                  resolvedChecks,
                  benchmark,
                  filename: `ecommerce-audit-${displayUrl}.pdf`,
                });
              }}
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </Button>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Another Site
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="font-semibold hover:text-green-600 transition-colors">
              ecomchecklist.net
            </Link>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id");
  const url = searchParams.get("url");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<AuditStatusResponse | null>(null);
  const [results, setResults] = useState<AuditResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Start a new audit
  const startAudit = useCallback(async () => {
    if (!url) return;

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start audit');
      }

      const data = await response.json();
      // Redirect to the audit ID URL
      window.history.replaceState({}, '', `/analyze?id=${data.id}`);
      setStatus({ id: data.id, status: 'pending', progress: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit');
    } finally {
      setIsStarting(false);
    }
  }, [url, email]);

  // Poll for status updates
  useEffect(() => {
    const currentId = auditId || status?.id;
    if (!currentId) return;

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/audit/status/${currentId}`);
        if (!response.ok) throw new Error('Failed to get status');

        const data: AuditStatusResponse = await response.json();

        if (cancelled) return;

        setStatus(data);

        if (data.status === 'completed') {
          // Fetch full results
          const resultsResponse = await fetch(`/api/audit/results/${currentId}`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            setResults(resultsData);
          }
        } else if (data.status === 'failed') {
          setError(data.errorMessage || 'Audit failed');
        } else {
          // Continue polling
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to check status');
        }
      }
    };

    pollStatus();

    return () => { cancelled = true; };
  }, [auditId, status?.id]);

  // If we have a URL but no audit ID, start a new audit
  useEffect(() => {
    if (url && !auditId && !status && !isStarting) {
      startAudit();
    }
  }, [url, auditId, status, isStarting, startAudit]);

  // Show loading if starting
  if (isStarting) {
    return <AuditProgress status="pending" progress={0} />;
  }

  // Show error
  if (error) {
    return (
      <AuditError
        message={error}
        onRetry={url ? startAudit : undefined}
      />
    );
  }

  // Show results if complete
  if (results) {
    return <AuditResults results={results} />;
  }

  // Show progress if processing
  if (status && (status.status === 'pending' || status.status === 'processing')) {
    return (
      <AuditProgress
        status={status.status}
        progress={status.progress}
        currentCheck={status.currentCheck}
      />
    );
  }

  // No audit ID and no URL - show error
  if (!auditId && !url) {
    return (
      <AuditError
        message="No audit specified. Please start from the home page."
      />
    );
  }

  // Initial loading state
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
        <p className="text-muted-foreground">Loading audit...</p>
      </div>
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
