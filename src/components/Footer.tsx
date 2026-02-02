"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Shield } from "lucide-react";
import { trackEvent } from "@/lib/analytics/gtm";

export function Footer() {
  const scrollToTop = () => {
    trackEvent("cta_click", { location: "footer", cta_text: "Analyze Free" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Left: Logo + Tagline */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity">
              <Image src="/logo.png" alt="EcomChecklist Logo" width={32} height={32} className="rounded-md" />
              <span className="font-bold text-lg">ecomchecklist.net</span>
            </Link>
            <p className="text-slate-400 text-sm">Your store&apos;s health, diagnosed.</p>
          </div>

          {/* Center: Navigation Links */}
          <div className="text-center">
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                Home
              </Link>
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>

          {/* Right: CTA + Trust Badges */}
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-sm mb-3">Ready to audit your store?</p>
            <Button
              size="sm"
              onClick={scrollToTop}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold mb-4"
            >
              Analyze Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <div className="flex items-center justify-center md:justify-end gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                SSL Secured
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ecomchecklist.net — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
