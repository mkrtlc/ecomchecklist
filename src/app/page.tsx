"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Star,
  Lock,
  Clock,
  Users,
  BarChart3,
  CreditCard,
  Mail,
  ChevronRight,
  Smartphone,
  Globe,
  Package,
  ExternalLink,
} from "lucide-react";
import { trackEvent, trackPageView, trackScrollDepth } from "@/lib/analytics/gtm";

export default function Home() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sitesAudited, setSitesAudited] = useState(12847);
  const [reportsLeft] = useState(7);

  const hasStartedFormRef = useRef(false);
  const lastUrlChangeTrackedAtRef = useRef(0);
  const testimonialsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSitesAudited((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trackPageView({ page_path: "/", page_title: "Home" });

    const fired = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      for (const p of [25, 50, 75, 100] as const) {
        if (pct >= p && !fired.has(p)) {
          fired.add(p);
          trackScrollDepth(p, { page_path: "/" });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !email) {
      trackEvent("form_error", {
        form_id: "audit_form",
        location: "hero",
        error: !url ? "missing_url" : "missing_email",
      });
      return;
    }

    trackEvent("form_submit", {
      form_id: "audit_form",
      location: "hero",
    });

    setIsAnalyzing(true);
    window.location.href = `/analyze?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`;
  };

  const checkpoints = [
    {
      category: "SEO & Discovery",
      count: 12,
      items: ["Meta titles & descriptions", "Schema markup", "Sitemap & robots.txt", "Heading structure"],
    },
    { category: "Performance", count: 10, items: ["Core Web Vitals", "Image optimization", "Mobile speed", "Server response"] },
    { category: "Trust & Security", count: 8, items: ["SSL certificate", "Trust badges", "Privacy policy", "Contact info"] },
    { category: "Conversion", count: 12, items: ["CTA visibility", "Checkout flow", "Cart abandonment risks", "Mobile UX"] },
    { category: "Technical", count: 8, items: ["Broken links", "404 errors", "Redirect chains", "Canonical tags"] },
  ];

  const testimonials = [
    {
      quote:
        "Found 3 critical issues that were killing my conversion rate. Fixed them and saw 23% increase in sales within a week.",
      author: "Sarah M.",
      role: "Shopify Store Owner",
      rating: 5,
    },
    {
      quote: "The most comprehensive free audit tool I've found. Beats paid alternatives I've tried.",
      author: "Marcus K.",
      role: "E-commerce Consultant",
      rating: 5,
    },
    {
      quote: "Discovered my checkout page was broken on mobile. Would have never known without this tool!",
      author: "Jennifer L.",
      role: "WooCommerce Store Owner",
      rating: 5,
    },
  ];

  const problems = [
    { icon: AlertTriangle, stat: "67%", text: "of stores have critical SEO issues" },
    { icon: Smartphone, stat: "53%", text: "of traffic is mobile (is your store ready?)" },
    { icon: Clock, stat: "3 sec", text: "load time = 40% higher bounce rate" },
    { icon: CreditCard, stat: "70%", text: "cart abandonment rate industry average" },
  ];

  const platforms = [
    { name: "Shopify", logo: "/logos/shopify.png" },
    { name: "WooCommerce", logo: "/logos/woocommerce.png" },
    { name: "BigCommerce", logo: "/logos/bigcommerce.png" },
    { name: "Magento", logo: "/logos/magento.png" },
    { name: "PrestaShop", logo: "/logos/prestashop.png" },
    { name: "OpenCart", logo: "/logos/opencart.png" },
    { name: "Wix", logo: "/logos/wix.png" },
    { name: "Squarespace", logo: "/logos/squarespace.png" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-2 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            Only <strong>{reportsLeft} detailed reports</strong> left today — basic audits always free
          </span>
        </span>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a0f1a] via-slate-900 to-indigo-950 pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">{sitesAudited.toLocaleString()}</strong> stores audited
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Secure</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              Your Store is <span className="text-rose-400 line-through decoration-2">Leaking Money</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Find Out Where</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get a <strong className="text-white">free 50-point audit</strong> of your e-commerce store. Uncover hidden issues killing
              your conversions — fix them and watch sales grow.
            </p>

            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto mb-6">
              <div className="bg-slate-800/50 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-2xl border border-slate-700/50">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      type="url"
                      placeholder="yourstore.com"
                      value={url}
                      onFocus={() => {
                        trackEvent("url_input_focus", { location: "hero" });
                        if (!hasStartedFormRef.current) {
                          hasStartedFormRef.current = true;
                          trackEvent("form_start", { form_id: "audit_form", location: "hero" });
                        }
                      }}
                      onChange={(e) => {
                        const next = e.target.value;
                        setUrl(next);

                        if (!hasStartedFormRef.current) {
                          hasStartedFormRef.current = true;
                          trackEvent("form_start", { form_id: "audit_form", location: "hero" });
                        }

                        const now = Date.now();
                        if (now - lastUrlChangeTrackedAtRef.current > 1500) {
                          lastUrlChangeTrackedAtRef.current = now;
                          trackEvent("url_input_change", {
                            location: "hero",
                            value_length: next.length,
                          });
                        }
                      }}
                      className="pl-12 h-14 text-base md:text-lg bg-slate-900/80 border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="your@email.com (to receive your report)"
                      value={email}
                      onFocus={() => {
                        trackEvent("email_input_focus", { location: "hero" });
                        if (!hasStartedFormRef.current) {
                          hasStartedFormRef.current = true;
                          trackEvent("form_start", { form_id: "audit_form", location: "hero" });
                        }
                      }}
                      onChange={(e) => {
                        const next = e.target.value;
                        setEmail(next);

                        if (!hasStartedFormRef.current) {
                          hasStartedFormRef.current = true;
                          trackEvent("form_start", { form_id: "audit_form", location: "hero" });
                        }
                      }}
                      className="pl-12 h-14 text-base md:text-lg bg-slate-900/80 border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="xl"
                    disabled={isAnalyzing}
                    className="h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl w-full shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Your Store...
                      </>
                    ) : (
                      <>
                        Get My Free Audit
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="flex justify-center mt-10 md:mt-12">
              <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900/50 ring-1 ring-white/10">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  poster="/hero-poster-16x9.svg"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: "16/9" }}
                >
                  <source src="/hero-video-16x9.webm" type="video/webm" />
                  <source src="/hero-video-16x9.mp4" type="video/mp4" />
                </video>
                <a
                  href="/hero-video-16x9.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("cta_click", { location: "hero_video", cta_text: "Open video" })}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white text-sm px-3 py-2 transition-colors border border-slate-700"
                  title="Open video in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open video
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-slate-500 mt-6">
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-4 h-4 line-through" />
                No credit card
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Results in 60 seconds
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Free forever
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-12 md:py-16 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
              Is Your Store Secretly <span className="text-rose-500">Sabotaging</span> Your Sales?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Most store owners don&apos;t know these shocking statistics:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center"
              >
                <problem.icon className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{problem.stat}</div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4" />
              50+ Checkpoints
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">The Most Comprehensive Free Audit</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We analyze every aspect of your store that impacts sales and search rankings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {checkpoints.map((checkpoint, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-all hover:border-amber-300 dark:hover:border-amber-700 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{checkpoint.category}</h3>
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    {checkpoint.count} checks
                  </span>
                </div>
                <ul className="space-y-2">
                  {checkpoint.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report preview */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">See Exactly What&apos;s Hurting Your Sales</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Your personalized report shows you critical issues, actionable fixes, and a clear priority order. No fluff, just results.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Prioritized issues by revenue impact",
                    "One-click fixes for common problems",
                    "Competitor comparison insights",
                    "Mobile vs desktop breakdown",
                    "Step-by-step fix instructions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  onClick={() => {
                    trackEvent("cta_click", { location: "sample_report_section", cta_text: "Get Your Free Report" });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900"
                >
                  Get Your Free Report
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Store Health Report</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">example-store.com</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">Critical Issues</span>
                    </div>
                    <span className="text-rose-600 font-bold text-xl">5</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-900/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">Warnings</span>
                    </div>
                    <span className="text-orange-600 font-bold text-xl">12</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">Passed</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-xl">33</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Overall Health Score</span>
                    <span className="text-2xl font-bold text-orange-500">
                      67<span className="text-sm text-slate-500">/100</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-rose-500 via-orange-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: "67%" }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Quick wins available: Fix 3 issues to hit 80+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">Loved by E-commerce Store Owners</h2>
            <p className="text-slate-600 dark:text-slate-400">Join thousands who&apos;ve improved their stores</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-12 bg-white dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">Works with all major e-commerce platforms</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-center h-10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  title={platform.name}
                >
                  <Image src={platform.logo} alt={platform.name} width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Stop Losing Sales. Start Fixing.</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">
            Every day you wait, potential customers are leaving your store. Get your free audit now and see what&apos;s really happening.
          </p>

          <Button
            size="xl"
            onClick={() => {
              trackEvent("cta_click", { location: "final_cta_section", cta_text: "Audit My Store Free" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-bold text-lg px-8 py-6 h-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
          >
            Audit My Store Free
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-slate-400 text-sm">
            <span>✓ Free forever</span>
            <span>✓ No credit card</span>
            <span>✓ Results in 60 seconds</span>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="EcomChecklist Logo" width={28} height={28} className="rounded-md" />
              <span className="font-semibold text-slate-900 dark:text-white">ecomchecklist.net</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <div className="text-sm text-slate-500">© {new Date().getFullYear()} ecomchecklist.net — All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
