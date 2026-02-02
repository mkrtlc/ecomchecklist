"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  ArrowRight, 
  ShoppingCart, 
  Search, 
  Zap, 
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
  ExternalLink
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sitesAudited, setSitesAudited] = useState(12847);
  const [reportsLeft, setReportsLeft] = useState(7);

  // Animate counter on load
  useEffect(() => {
    const interval = setInterval(() => {
      setSitesAudited(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !email) return;
    
    setIsAnalyzing(true);
    // Redirect to analysis page with email
    window.location.href = `/analyze?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`;
  };

  const checkpoints = [
    { category: "SEO & Discovery", count: 12, items: ["Meta titles & descriptions", "Schema markup", "Sitemap & robots.txt", "Heading structure"] },
    { category: "Performance", count: 10, items: ["Core Web Vitals", "Image optimization", "Mobile speed", "Server response"] },
    { category: "Trust & Security", count: 8, items: ["SSL certificate", "Trust badges", "Privacy policy", "Contact info"] },
    { category: "Conversion", count: 12, items: ["CTA visibility", "Checkout flow", "Cart abandonment risks", "Mobile UX"] },
    { category: "Technical", count: 8, items: ["Broken links", "404 errors", "Redirect chains", "Canonical tags"] },
  ];

  const testimonials = [
    {
      quote: "Found 3 critical issues that were killing my conversion rate. Fixed them and saw 23% increase in sales within a week.",
      author: "Sarah M.",
      role: "Shopify Store Owner",
      rating: 5
    },
    {
      quote: "The most comprehensive free audit tool I've found. Beats paid alternatives I've tried.",
      author: "Marcus K.",
      role: "E-commerce Consultant",
      rating: 5
    },
    {
      quote: "Discovered my checkout page was broken on mobile. Would have never known without this tool!",
      author: "Jennifer L.",
      role: "WooCommerce Store Owner",
      rating: 5
    }
  ];

  const problems = [
    { icon: AlertTriangle, stat: "67%", text: "of stores have critical SEO issues" },
    { icon: Smartphone, stat: "53%", text: "of traffic is mobile (is your store ready?)" },
    { icon: Clock, stat: "3 sec", text: "load time = 40% higher bounce rate" },
    { icon: CreditCard, stat: "70%", text: "cart abandonment rate industry average" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-background">
      {/* Urgency Banner */}
      <div className="bg-amber-500 text-black py-2 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Only <strong>{reportsLeft} detailed reports</strong> left today — basic audits always free</span>
        </span>
      </div>

      {/* Hero Section - Above the Fold */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Social Proof Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span><strong className="text-white">{sitesAudited.toLocaleString()}</strong> stores audited</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>100% Free & Secure</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              Your Store is <span className="text-red-400 line-through decoration-2">Leaking Money</span>
              <br />
              <span className="text-green-400">Find Out Where</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get a <strong className="text-white">free 50-point audit</strong> of your e-commerce store. 
              Uncover hidden issues killing your conversions — fix them and watch sales grow.
            </p>

            {/* CTA Form */}
            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto mb-6">
              <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl shadow-2xl">
                <div className="flex flex-col gap-3">
                  {/* URL Input */}
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="url"
                      placeholder="yourstore.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-12 h-14 text-base md:text-lg border-2 border-slate-200 dark:border-slate-600 focus:border-green-500 rounded-xl"
                      required
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com (to receive your report)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-base md:text-lg border-2 border-slate-200 dark:border-slate-600 focus:border-green-500 rounded-xl"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="xl" 
                    disabled={isAnalyzing}
                    className="h-14 text-lg font-bold bg-green-600 hover:bg-green-700 rounded-xl w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Your Store...
                      </>
                    ) : (
                      <>
                        🚀 Get My Free Audit
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Hero video */}
            <div className="flex justify-center mt-10 md:mt-12">
              <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 bg-black/30 ring-2 ring-white/10">
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
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm px-3 py-2 transition-colors"
                  title="Open video in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open video
                </a>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-slate-400">
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
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free forever
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Agitation Section */}
      <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Is Your Store Secretly <span className="text-red-500">Sabotaging</span> Your Sales?
            </h2>
            <p className="text-muted-foreground">Most store owners don't know these shocking statistics:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border text-center">
                <problem.icon className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {problem.stat}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Check Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4" />
              50+ Checkpoints
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              The Most Comprehensive Free Audit
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We analyze every aspect of your store that impacts sales and search rankings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {checkpoints.map((checkpoint, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all hover:border-green-300 dark:hover:border-green-700 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{checkpoint.category}</h3>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    {checkpoint.count} checks
                  </span>
                </div>
                <ul className="space-y-2">
                  {checkpoint.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Report Preview */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  See Exactly What's Hurting Your Sales
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your personalized report shows you critical issues, actionable fixes, and a clear priority order. No fluff, just results.
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Prioritized issues by revenue impact",
                    "One-click fixes for common problems",
                    "Competitor comparison insights",
                    "Mobile vs desktop breakdown",
                    "Step-by-step fix instructions"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="font-bold"
                >
                  Get Your Free Report
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Report Preview Card */}
              <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-xl border-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold">Store Health Report</div>
                    <div className="text-sm text-muted-foreground">example-store.com</div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Critical Issues</span>
                    </div>
                    <span className="text-red-600 font-bold text-xl">5</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Warnings</span>
                    </div>
                    <span className="text-amber-600 font-bold text-xl">12</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Passed</span>
                    </div>
                    <span className="text-green-600 font-bold text-xl">33</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Health Score</span>
                    <span className="text-2xl font-bold text-amber-500">67<span className="text-sm text-muted-foreground">/100</span></span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-red-500 via-amber-500 to-amber-500 h-3 rounded-full transition-all" style={{ width: '67%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    🔥 Quick wins available: Fix 3 issues to hit 80+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Loved by E-commerce Store Owners
            </h2>
            <p className="text-muted-foreground">Join thousands who've improved their stores</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-12 bg-slate-50 dark:bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">Works with all major e-commerce platforms</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale">
              {["Shopify", "WooCommerce", "BigCommerce", "Magento", "Squarespace", "Wix"].map((platform) => (
                <span key={platform} className="text-lg font-bold text-slate-500">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Stop Losing Sales. Start Fixing.
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto text-lg">
            Every day you wait, potential customers are leaving your store. Get your free audit now and see what's really happening.
          </p>
          
          <Button 
            size="xl" 
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-bold text-lg px-8 py-6 h-auto"
          >
            🚀 Audit My Store Free
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-green-100 text-sm">
            <span>✓ Free forever</span>
            <span>✓ No credit card</span>
            <span>✓ Results in 60 seconds</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="EcomChecklist Logo" 
                width={28} 
                height={28}
                className="rounded-md"
              />
              <span className="font-semibold">ecomchecklist.net</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ecomchecklist.net — All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
