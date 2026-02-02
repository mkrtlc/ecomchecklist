"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Footer } from "@/components/Footer";
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
  ExternalLink,
  Download,
  Share2,
  RefreshCw,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { trackEvent, trackPageView } from "@/lib/analytics/gtm";

import type { AuditCategoryId, AuditCheckDefinition, AuditCheckResult, CheckStatus } from "@/lib/audit";
import {
  compareToBenchmark,
  computeAuditScore,
  createRegistry,
  downloadAuditReportPdf,
  getIndustryBenchmark,
  resolveAuditRun,
} from "@/lib/audit";

// Types
interface CheckItem {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  description: string;
  recommendation?: string;
}

interface Category {
  id: AuditCategoryId;
  name: string;
  icon: React.ElementType;
  score: number;
  items: CheckItem[];
}

// Mock Data Generator
function generateMockData(url: string): Category[] {
  return [
    {
      id: "seo",
      name: "SEO Analysis",
      icon: Search,
      score: 72,
      items: [
        {
          id: "meta-title",
          name: "Meta Title",
          status: "pass",
          description: "Page has a valid meta title with optimal length (55 characters).",
        },
        {
          id: "meta-description",
          name: "Meta Description",
          status: "warning",
          description: "Meta description is too short (85 characters). Recommended: 150-160 characters.",
          recommendation: "Expand your meta description to include relevant keywords and a compelling call-to-action.",
        },
        {
          id: "h1-tag",
          name: "H1 Heading",
          status: "pass",
          description: "Page has exactly one H1 heading, which is optimal for SEO.",
        },
        {
          id: "heading-structure",
          name: "Heading Hierarchy",
          status: "fail",
          description: "Heading structure has gaps (H1 → H3, missing H2). This can confuse search engines.",
          recommendation: "Restructure your headings to follow a logical hierarchy: H1 → H2 → H3.",
        },
        {
          id: "image-alt",
          name: "Image Alt Tags",
          status: "warning",
          description: "3 out of 12 images are missing alt attributes.",
          recommendation: "Add descriptive alt text to all product images for better accessibility and SEO.",
        },
        {
          id: "schema-markup",
          name: "Product Schema",
          status: "fail",
          description: "No Product schema markup detected. Missing rich snippet opportunity.",
          recommendation: "Implement structured data for products to enable rich snippets in search results.",
        },
        {
          id: "canonical-url",
          name: "Canonical URL",
          status: "pass",
          description: "Canonical URL is properly set.",
        },
        {
          id: "robots-txt",
          name: "Robots.txt",
          status: "pass",
          description: "Robots.txt file is accessible and properly configured.",
        },
      ],
    },
    {
      id: "performance",
      name: "Performance",
      icon: Zap,
      score: 58,
      items: [
        {
          id: "page-load",
          name: "Page Load Time",
          status: "fail",
          description: "Page takes 4.2 seconds to fully load. Target: under 3 seconds.",
          recommendation: "Optimize images, enable compression, and consider lazy loading for below-the-fold content.",
        },
        {
          id: "lcp",
          name: "Largest Contentful Paint",
          status: "warning",
          description: "LCP is 3.1 seconds. Good threshold is 2.5 seconds.",
          recommendation: "Optimize your hero image and consider using next-gen formats like WebP.",
        },
        {
          id: "fid",
          name: "First Input Delay",
          status: "pass",
          description: "FID is 45ms, which is excellent (threshold: 100ms).",
        },
        {
          id: "cls",
          name: "Cumulative Layout Shift",
          status: "warning",
          description: "CLS score is 0.18. Should be under 0.1 for good user experience.",
          recommendation: "Set explicit dimensions for images and ads to prevent layout shifts.",
        },
        {
          id: "image-optimization",
          name: "Image Optimization",
          status: "fail",
          description: "Images are not in next-gen formats. Potential savings: 450KB.",
          recommendation: "Convert images to WebP format and implement responsive images with srcset.",
        },
        {
          id: "compression",
          name: "Text Compression",
          status: "pass",
          description: "Gzip compression is enabled for text resources.",
        },
        {
          id: "render-blocking",
          name: "Render-Blocking Resources",
          status: "warning",
          description: "3 render-blocking CSS files detected.",
          recommendation: "Inline critical CSS and defer non-critical stylesheets.",
        },
      ],
    },
    {
      id: "security",
      name: "Security & Trust",
      icon: Shield,
      score: 85,
      items: [
        {
          id: "ssl",
          name: "SSL Certificate",
          status: "pass",
          description: "Valid SSL certificate installed. Connection is secure.",
        },
        {
          id: "https-redirect",
          name: "HTTPS Redirect",
          status: "pass",
          description: "HTTP traffic is properly redirected to HTTPS.",
        },
        {
          id: "mixed-content",
          name: "Mixed Content",
          status: "pass",
          description: "No mixed content issues detected.",
        },
        {
          id: "trust-badges",
          name: "Trust Badges",
          status: "warning",
          description: "Payment trust badges not detected on product pages.",
          recommendation: "Add recognizable trust badges (SSL seal, payment icons, security badges) near the buy button.",
        },
        {
          id: "privacy-policy",
          name: "Privacy Policy",
          status: "pass",
          description: "Privacy policy page detected and accessible.",
        },
        {
          id: "contact-info",
          name: "Contact Information",
          status: "pass",
          description: "Contact page with email and address found.",
        },
        {
          id: "security-headers",
          name: "Security Headers",
          status: "warning",
          description: "Missing some recommended security headers (CSP, X-Frame-Options).",
          recommendation: "Implement Content Security Policy and X-Frame-Options headers.",
        },
      ],
    },
    {
      id: "conversion",
      name: "Conversion",
      icon: TrendingUp,
      score: 64,
      items: [
        {
          id: "cta-visibility",
          name: "CTA Button Visibility",
          status: "pass",
          description: "Add to Cart button is prominent and above the fold.",
        },
        {
          id: "product-images",
          name: "Product Images",
          status: "warning",
          description: "Only 2 product images found. Recommended: 4+ images with zoom.",
          recommendation: "Add more product images from different angles, including lifestyle shots.",
        },
        {
          id: "price-visibility",
          name: "Price Visibility",
          status: "pass",
          description: "Price is clearly displayed and easy to find.",
        },
        {
          id: "reviews",
          name: "Customer Reviews",
          status: "fail",
          description: "No customer review section detected on product pages.",
          recommendation: "Add a reviews section to build social proof. Consider integrating with review platforms.",
        },
        {
          id: "urgency-elements",
          name: "Urgency Elements",
          status: "warning",
          description: "No stock indicators or urgency elements detected.",
          recommendation: "Add low stock warnings or limited-time offers to create urgency.",
        },
        {
          id: "mobile-checkout",
          name: "Mobile Checkout",
          status: "pass",
          description: "Checkout is mobile-responsive and touch-friendly.",
        },
        {
          id: "guest-checkout",
          name: "Guest Checkout",
          status: "fail",
          description: "Guest checkout option not detected. This may increase cart abandonment.",
          recommendation: "Enable guest checkout to reduce friction in the purchase process.",
        },
        {
          id: "cart-persistence",
          name: "Cart Persistence",
          status: "pass",
          description: "Cart items persist across sessions.",
        },
      ],
    },
  ];
}

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
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
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

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "example-store.com";
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["seo"]);

  const auditStartTrackedRef = useRef(false);
  const auditCompleteTrackedRef = useRef(false);

  // Generate mock data
  const categories = generateMockData(url);

  // Convert mock data into the audit model (temporary until real analyzers land)
  const definitions: AuditCheckDefinition[] = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      id: item.id,
      title: item.name,
      category: cat.id,
      severity:
        cat.id === "security" ? "critical" : cat.id === "performance" ? "high" : cat.id === "conversion" ? "high" : "medium",
      whyImportant: item.description,
      howToFix: item.recommendation ?? "No action needed.",
    }))
  );

  const results: AuditCheckResult[] = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      checkId: item.id,
      status: (item.status === "warning" ? "warn" : item.status) as CheckStatus,
      evidence: [item.description],
      urlsTested: [url.startsWith("http") ? url : `https://${url}`],
    }))
  );

  const run = {
    url: url.startsWith("http") ? url : `https://${url}`,
    auditedAt: new Date().toISOString(),
    checks: results,
  };

  const registry = createRegistry(definitions);
  const resolvedChecks = resolveAuditRun(run, registry);
  const score = computeAuditScore({ definitions, results });

  const categoryScoreMap = new Map(score.byCategory.map((c) => [c.category, c.score0to100] as const));
  const scoredCategories = categories.map((cat) => ({
    ...cat,
    score: categoryScoreMap.get(cat.id) ?? 0,
  }));

  const overallScore = score.overall.score0to100;

  const benchmark = getIndustryBenchmark();
  const benchmarkComparison = compareToBenchmark({ yourScore0to100: overallScore, benchmark });

  useEffect(() => {
    trackPageView({ page_path: "/analyze" });

    if (!auditStartTrackedRef.current) {
      auditStartTrackedRef.current = true;
      trackEvent("audit_start", {
        url_provided: Boolean(url),
      });
    }
  }, [url]);

  useEffect(() => {
    if (auditCompleteTrackedRef.current) return;
    auditCompleteTrackedRef.current = true;

    trackEvent("audit_complete", {
      score: overallScore,
      url_provided: Boolean(url),
    });
  }, [overallScore, url]);

  // Count totals
  const totalChecks = scoredCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const passedChecks = scoredCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.status === "pass").length,
    0
  );
  const failedChecks = scoredCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.status === "fail").length,
    0
  );
  const warningChecks = scoredCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.status === "warning").length,
    0
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const isExpanded = prev.includes(id);
      if (!isExpanded) {
        trackEvent("check_expand", {
          location: "category_card",
          check_id: id,
        });
      }
      return isExpanded ? prev.filter((c) => c !== id) : [...prev, id];
    });
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

  // Clean URL for display
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
                  trackEvent("pdf_download", {
                    location: "analyze_header",
                    filename: `ecommerce-audit-${displayUrl}.pdf`,
                  });

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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-gray-50 dark:from-green-950/20 dark:to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Ring */}
              <div className="flex-shrink-0">
                <ScoreRing score={overallScore} size="large" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{displayUrl}</span>
                  <a
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  Your Store Score:{" "}
                  <span className={getScoreColor(overallScore)}>{getScoreLabel(overallScore)}</span>
                </h1>
                <p className="text-muted-foreground mb-2">
                  We analyzed {totalChecks} checkpoints across 4 categories. Here&apos;s what we found.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your score {overallScore} · {benchmark.industryLabel} average {benchmark.industryAvgScore0to100} ({benchmarkComparison.label})
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Analysis completed just now</span>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-amber-600">{warningChecks}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {scoredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-green-600 dark:bg-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want to Fix These Issues?
          </h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Get a detailed action plan with step-by-step instructions to improve your store&apos;s performance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary">
              Get Full Report
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </Button>
          </div>
        </div>
      </section>

      <Footer />
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
