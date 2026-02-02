export interface PageSpeedMetrics {
  score0to100: number;
  lcp?: number; // Largest Contentful Paint in ms
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint in ms (replaces FID)
  fcp?: number; // First Contentful Paint in ms
  ttfb?: number; // Time to First Byte in ms
  speedIndex?: number;
  totalBlockingTime?: number;
  raw?: unknown;
}

export interface PageSpeedAdapter {
  getMobilePerformanceScore0to100: (url: string) => Promise<PageSpeedMetrics>;
  getDesktopPerformanceScore0to100?: (url: string) => Promise<PageSpeedMetrics>;
}

const API_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export function createPageSpeedAdapter(apiKey?: string): PageSpeedAdapter {
  const fetchMetrics = async (url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedMetrics> => {
    const params = new URLSearchParams({
      url,
      strategy,
      category: 'performance',
    });

    if (apiKey) {
      params.set('key', apiKey);
    }

    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PageSpeed API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Extract Lighthouse metrics
    const lighthouse = data.lighthouseResult;
    const audits = lighthouse?.audits || {};

    // Performance score (0-1 in API, convert to 0-100)
    const performanceScore = lighthouse?.categories?.performance?.score;
    const score0to100 = performanceScore != null ? Math.round(performanceScore * 100) : 0;

    // Core Web Vitals
    const lcp = audits['largest-contentful-paint']?.numericValue; // ms
    const cls = audits['cumulative-layout-shift']?.numericValue;
    const inp = audits['interaction-to-next-paint']?.numericValue; // ms (may not be present)
    const fcp = audits['first-contentful-paint']?.numericValue; // ms
    const ttfb = audits['server-response-time']?.numericValue; // ms
    const speedIndex = audits['speed-index']?.numericValue;
    const totalBlockingTime = audits['total-blocking-time']?.numericValue;

    return {
      score0to100,
      lcp: lcp ? Math.round(lcp) : undefined,
      cls: cls != null ? Math.round(cls * 1000) / 1000 : undefined, // Round to 3 decimals
      inp: inp ? Math.round(inp) : undefined,
      fcp: fcp ? Math.round(fcp) : undefined,
      ttfb: ttfb ? Math.round(ttfb) : undefined,
      speedIndex: speedIndex ? Math.round(speedIndex) : undefined,
      totalBlockingTime: totalBlockingTime ? Math.round(totalBlockingTime) : undefined,
      raw: {
        lighthouseVersion: lighthouse?.lighthouseVersion,
        fetchTime: lighthouse?.fetchTime,
        requestedUrl: lighthouse?.requestedUrl,
        finalUrl: lighthouse?.finalUrl,
      },
    };
  };

  return {
    async getMobilePerformanceScore0to100(url: string): Promise<PageSpeedMetrics> {
      return fetchMetrics(url, 'mobile');
    },
    async getDesktopPerformanceScore0to100(url: string): Promise<PageSpeedMetrics> {
      return fetchMetrics(url, 'desktop');
    },
  };
}

// Interpret Core Web Vitals
export function interpretLCP(ms: number): 'good' | 'needs-improvement' | 'poor' {
  if (ms <= 2500) return 'good';
  if (ms <= 4000) return 'needs-improvement';
  return 'poor';
}

export function interpretCLS(score: number): 'good' | 'needs-improvement' | 'poor' {
  if (score <= 0.1) return 'good';
  if (score <= 0.25) return 'needs-improvement';
  return 'poor';
}

export function interpretINP(ms: number): 'good' | 'needs-improvement' | 'poor' {
  if (ms <= 200) return 'good';
  if (ms <= 500) return 'needs-improvement';
  return 'poor';
}

export function interpretFCP(ms: number): 'good' | 'needs-improvement' | 'poor' {
  if (ms <= 1800) return 'good';
  if (ms <= 3000) return 'needs-improvement';
  return 'poor';
}
