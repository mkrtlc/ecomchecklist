"use client";

import { useState } from "react";
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
  Loader2
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    // Redirect to analysis page
    window.location.href = `/analyze?url=${encodeURIComponent(url)}`;
  };

  const features = [
    {
      icon: Search,
      title: "SEO Analysis",
      description: "Meta tags, headings, schema markup, and search visibility"
    },
    {
      icon: Zap,
      title: "Performance Score",
      description: "Page speed, Core Web Vitals, and loading optimization"
    },
    {
      icon: Shield,
      title: "Security Check",
      description: "SSL, trust signals, and payment security indicators"
    },
    {
      icon: TrendingUp,
      title: "Conversion Audit",
      description: "CTA placement, checkout flow, and UX improvements"
    }
  ];

  const checklist = [
    "Product page optimization",
    "Mobile responsiveness",
    "Checkout flow analysis",
    "Trust signals & reviews",
    "Image optimization",
    "Schema markup validation",
    "Page speed metrics",
    "Security certificates"
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 to-white/90 dark:from-green-950/80 dark:to-background/90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Free E-commerce Store Audit
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Is Your Store Ready to{" "}
              <span className="text-green-600 dark:text-green-500">Convert?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get a comprehensive audit of your e-commerce store. Find hidden issues hurting your sales and get actionable fixes in minutes.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleAnalyze} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="Enter your store URL (e.g., mystore.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
                <Button type="submit" size="xl" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Free
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                No signup required. Get your report instantly.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              What We Analyze
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tool scans 50+ critical checkpoints to identify issues that could be costing you sales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist Preview Section */}
      <section className="py-20 bg-gray-50 dark:bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  The Complete E-commerce Checklist
                </h2>
                <p className="text-muted-foreground mb-8">
                  Every successful store follows these fundamentals. Find out which ones you're missing.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-card rounded-xl p-6 shadow-lg border">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <div>
                    <div className="font-semibold">Sample Analysis</div>
                    <div className="text-sm text-muted-foreground">example-store.com</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <span className="text-sm font-medium">Critical Issues</span>
                    <span className="text-red-600 font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <span className="text-sm font-medium">Warnings</span>
                    <span className="text-amber-600 font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="text-sm font-medium">Passed Checks</span>
                    <span className="text-green-600 font-bold">33</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Overall Score</div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-amber-500">67</span>
                    <span className="text-muted-foreground mb-1">/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 dark:bg-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Store?
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of store owners who have improved their conversion rates using our free audit tool.
          </p>
          <Button 
            size="xl" 
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Start Free Analysis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
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
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
