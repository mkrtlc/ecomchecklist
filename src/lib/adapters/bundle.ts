import type { CheckAdapterBundle } from '../audit/checks/types';
import {
  createStaticHtmlAdapter,
  createCachedHtmlAdapter,
  type HtmlAdapter,
} from './html';
import { createSslAdapter } from './ssl';
import { createHeadersAdapter } from './headers';
import { createPageSpeedAdapter } from './pagespeed';
import { createPlatformAdapter } from './platform';
import { createStaticViewportAdapter } from './viewport';
import { createStaticImagesAdapter } from './images';

export interface AdapterBundleOptions {
  googlePageSpeedApiKey?: string;
  browserlessApiKey?: string;
  enableCaching?: boolean;
}

// Store for shared HTML responses within an audit
interface HtmlCache {
  html: string;
  finalUrl?: string;
  headers?: Record<string, string>;
}

interface ExtendedAdapterBundle extends CheckAdapterBundle {
  // Extended adapters not in base interface
  _headers: ReturnType<typeof createHeadersAdapter>;
  _platform: ReturnType<typeof createPlatformAdapter>;
  // Shared cache for the audit run
  _cache: {
    html: Map<string, HtmlCache>;
    platform?: string;
  };
}

export function createAdapterBundle(options: AdapterBundleOptions = {}): ExtendedAdapterBundle {
  // Create base HTML adapter
  let htmlAdapter: HtmlAdapter = createStaticHtmlAdapter();
  if (options.enableCaching !== false) {
    htmlAdapter = createCachedHtmlAdapter(htmlAdapter);
  }

  // Create shared cache for this bundle instance
  const _cache = {
    html: new Map<string, HtmlCache>(),
    platform: undefined as string | undefined,
  };

  // Create SSL adapter
  const sslAdapter = createSslAdapter();

  // Create headers adapter
  const headersAdapter = createHeadersAdapter();

  // Create PageSpeed adapter
  const pagespeedAdapter = createPageSpeedAdapter(options.googlePageSpeedApiKey);

  // Create platform adapter
  const platformAdapter = createPlatformAdapter();

  // Create viewport adapter (static fallback)
  const viewportAdapter = createStaticViewportAdapter(htmlAdapter);

  // Create images adapter (static fallback)
  const imagesAdapter = createStaticImagesAdapter(htmlAdapter);

  return {
    // HTML adapter (core)
    html: {
      async fetchHtml(url: string) {
        // Check cache first
        const cached = _cache.html.get(url);
        if (cached) {
          return cached;
        }

        const result = await htmlAdapter.fetchHtml(url);
        _cache.html.set(url, result);

        // Detect platform on first fetch
        if (!_cache.platform) {
          const platformInfo = await platformAdapter.detectPlatform(result.html, url);
          _cache.platform = platformInfo.platform;
        }

        return result;
      },
    },

    // SSL adapter
    ssl: {
      async getCertificateInfo(hostname: string) {
        return sslAdapter.getCertificateInfo(hostname);
      },
    },

    // PageSpeed adapter
    pagespeed: {
      async getMobilePerformanceScore0to100(url: string) {
        const result = await pagespeedAdapter.getMobilePerformanceScore0to100(url);
        // Return with nested lighthouseResult structure that checks expect
        const rawData = result.raw as Record<string, unknown> | undefined;
        return {
          score0to100: result.score0to100,
          raw: {
            lighthouseResult: {
              audits: {
                'largest-contentful-paint': { numericValue: result.lcp },
                'cumulative-layout-shift': { numericValue: result.cls },
                'interaction-to-next-paint': { numericValue: result.inp },
                'first-contentful-paint': { numericValue: result.fcp },
                'server-response-time': { numericValue: result.ttfb },
                'speed-index': { numericValue: result.speedIndex },
                'total-blocking-time': { numericValue: result.totalBlockingTime },
              },
            },
            ...(rawData || {}),
          },
        };
      },
    },

    // Viewport adapter
    viewport: {
      async isAddToCartAboveFold(url: string, opts) {
        return viewportAdapter.isAddToCartAboveFold(url, opts);
      },
    },

    // Images adapter
    images: {
      async analyzeProductImages(url: string) {
        const result = await imagesAdapter.analyzeProductImages(url);
        return {
          images: result.productImages.map(img => ({
            src: img.src,
            width: img.width,
            height: img.height,
            format: img.format,
            bytes: img.bytes,
          })),
          raw: result,
        };
      },
    },

    // Headers adapter (for security checks)
    headers: {
      async getHeaders(url: string) {
        const result = await headersAdapter.getHeaders(url);
        return {
          headers: result.all,
          raw: result,
        };
      },
    },

    // Platform adapter
    platform: {
      async detectPlatform(html: string, url?: string) {
        return platformAdapter.detectPlatform(html, url);
      },
    },

    // Extended adapters (internal use)
    _headers: headersAdapter,
    _platform: platformAdapter,
    _cache,
  };
}

// Default bundle for quick use
let defaultBundle: ReturnType<typeof createAdapterBundle> | null = null;

export function getDefaultAdapterBundle(): ReturnType<typeof createAdapterBundle> {
  if (!defaultBundle) {
    defaultBundle = createAdapterBundle({
      googlePageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      browserlessApiKey: process.env.BROWSERLESS_API_KEY,
      enableCaching: true,
    });
  }
  return defaultBundle;
}

// Create a fresh bundle for each audit (recommended)
export function createAuditAdapterBundle(): ReturnType<typeof createAdapterBundle> {
  return createAdapterBundle({
    googlePageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
    browserlessApiKey: process.env.BROWSERLESS_API_KEY,
    enableCaching: true,
  });
}
