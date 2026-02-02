export interface HtmlFetchResult {
  html: string;
  finalUrl?: string;
  headers?: Record<string, string>;
  statusCode?: number;
  raw?: unknown;
}

export interface HtmlAdapter {
  fetchHtml: (url: string) => Promise<HtmlFetchResult>;
}

// Common user agents for rotating
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Detect if a page requires JavaScript rendering
export function detectSpaPatterns(html: string): boolean {
  const spaIndicators = [
    // React/Next.js
    /<div[^>]*id="__next"[^>]*>\s*<\/div>/i,
    /<div[^>]*id="root"[^>]*>\s*<\/div>/i,
    /<div[^>]*id="app"[^>]*>\s*<\/div>/i,
    // Vue/Nuxt
    /<div[^>]*id="__nuxt"[^>]*>/i,
    // Angular
    /<app-root[^>]*>/i,
    // Generic SPA indicators
    /noscript.*enable javascript/i,
    /please enable javascript/i,
    // Very little content (likely SPA)
  ];

  // Check for SPA patterns
  for (const pattern of spaIndicators) {
    if (pattern.test(html)) {
      return true;
    }
  }

  // Check if page has very little content (likely SPA loading)
  const textContent = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (textContent.length < 500 && html.includes('<script')) {
    return true;
  }

  return false;
}

// Create a static HTML adapter using fetch
export function createStaticHtmlAdapter(): HtmlAdapter {
  return {
    async fetchHtml(url: string): Promise<HtmlFetchResult> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          redirect: 'follow',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        return {
          html,
          finalUrl: response.url,
          headers,
          statusCode: response.status,
          raw: {
            redirected: response.redirected,
            type: response.type,
          },
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
  };
}

// Cache for HTML responses
const htmlCache = new Map<string, { result: HtmlFetchResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function createCachedHtmlAdapter(baseAdapter: HtmlAdapter): HtmlAdapter {
  return {
    async fetchHtml(url: string): Promise<HtmlFetchResult> {
      const cached = htmlCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }

      const result = await baseAdapter.fetchHtml(url);
      htmlCache.set(url, { result, timestamp: Date.now() });

      // Cleanup old cache entries
      if (htmlCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of htmlCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            htmlCache.delete(key);
          }
        }
      }

      return result;
    },
  };
}
