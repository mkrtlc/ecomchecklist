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
      daysUntilExpiry?: number;
      raw?: unknown;
    }>;
  };

  html?: {
    fetchHtml: (url: string) => Promise<{
      html: string;
      finalUrl?: string;
      headers?: Record<string, string>;
      statusCode?: number;
      raw?: unknown;
    }>;
  };

  headers?: {
    /** Fetch HTTP response headers for a URL */
    getHeaders: (url: string) => Promise<{
      all: Record<string, string>;
      security: {
        strictTransportSecurity?: string;
        contentSecurityPolicy?: string;
        xFrameOptions?: string;
        xContentTypeOptions?: string;
        referrerPolicy?: string;
        permissionsPolicy?: string;
      };
      caching: {
        cacheControl?: string;
        expires?: string;
        etag?: string;
      };
      compression: {
        contentEncoding?: string;
      };
      raw?: unknown;
    }>;
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

  platform?: {
    /** Detect e-commerce platform from HTML */
    detectPlatform: (html: string, url?: string) => Promise<{
      platform: string;
      confidence: 'high' | 'medium' | 'low';
      evidence: string[];
    }>;
  };
}

export interface AuditCheck {
  definition: AuditCheckDefinition;
  run: (ctx: CheckContext, adapters: CheckAdapterBundle) => Promise<AuditCheckResult>;
}
