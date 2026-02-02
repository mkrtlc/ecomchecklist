import type { AuditCheckDefinition, AuditCheckResult } from "../types";

export interface CheckContext {
  url: string;
}

export interface CheckAdapterBundle {
  pagespeed?: {
    /** Returns Lighthouse-style performance score 0..100 (mobile). */
    getMobilePerformanceScore0to100: (url: string) => Promise<{ score0to100: number; raw?: unknown }>;
  };

  ssl?: {
    getCertificateInfo: (
      hostname: string
    ) => Promise<{
      valid: boolean;
      expiresAt?: string; // ISO
      issuer?: string;
      raw?: unknown;
    }>;
  };

  html?: {
    fetchHtml: (url: string) => Promise<{ html: string; finalUrl?: string; raw?: unknown }>;
  };

  viewport?: {
    isAddToCartAboveFold: (
      url: string,
      opts?: { viewportWidth?: number; viewportHeight?: number }
    ) => Promise<{ aboveFold: boolean; evidence?: string[]; raw?: unknown }>;
  };

  images?: {
    analyzeProductImages: (
      url: string
    ) => Promise<{
      images: Array<{ src: string; width?: number; height?: number; format?: string; bytes?: number }>;
      raw?: unknown;
    }>;
  };

  headers?: {
    getHeaders: (url: string) => Promise<{ headers: Record<string, string>; raw?: unknown }>;
  };

  platform?: {
    detectPlatform: (
      html: string,
      url?: string
    ) => Promise<{ platform: string; confidence?: 'high' | 'medium' | 'low'; raw?: unknown }>;
  };
}

export interface AuditCheck {
  definition: AuditCheckDefinition;
  run: (ctx: CheckContext, adapters: CheckAdapterBundle) => Promise<AuditCheckResult>;
}
