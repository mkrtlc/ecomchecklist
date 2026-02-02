export interface HeadersInfo {
  all: Record<string, string>;
  security: {
    strictTransportSecurity?: string;
    contentSecurityPolicy?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    xXssProtection?: string;
  };
  caching: {
    cacheControl?: string;
    expires?: string;
    etag?: string;
    lastModified?: string;
    pragma?: string;
  };
  compression: {
    contentEncoding?: string;
    transferEncoding?: string;
    vary?: string;
  };
  server: {
    server?: string;
    xPoweredBy?: string;
  };
  raw?: unknown;
}

export interface HeadersAdapter {
  getHeaders: (url: string) => Promise<HeadersInfo>;
}

export function createHeadersAdapter(): HeadersAdapter {
  return {
    async getHeaders(url: string): Promise<HeadersInfo> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EcomChecklist/1.0; +https://ecomchecklist.net)',
          },
          redirect: 'follow',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const all: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          all[key.toLowerCase()] = value;
        });

        return {
          all,
          security: {
            strictTransportSecurity: all['strict-transport-security'],
            contentSecurityPolicy: all['content-security-policy'],
            xFrameOptions: all['x-frame-options'],
            xContentTypeOptions: all['x-content-type-options'],
            referrerPolicy: all['referrer-policy'],
            permissionsPolicy: all['permissions-policy'] || all['feature-policy'],
            xXssProtection: all['x-xss-protection'],
          },
          caching: {
            cacheControl: all['cache-control'],
            expires: all['expires'],
            etag: all['etag'],
            lastModified: all['last-modified'],
            pragma: all['pragma'],
          },
          compression: {
            contentEncoding: all['content-encoding'],
            transferEncoding: all['transfer-encoding'],
            vary: all['vary'],
          },
          server: {
            server: all['server'],
            xPoweredBy: all['x-powered-by'],
          },
          raw: {
            statusCode: response.status,
            statusText: response.statusText,
            redirected: response.redirected,
            finalUrl: response.url,
          },
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
  };
}

// Analyze security headers and return a summary
export function analyzeSecurityHeaders(headers: HeadersInfo['security']): {
  score: number;
  missing: string[];
  present: string[];
} {
  const securityHeaders = [
    { name: 'Strict-Transport-Security (HSTS)', value: headers.strictTransportSecurity },
    { name: 'Content-Security-Policy (CSP)', value: headers.contentSecurityPolicy },
    { name: 'X-Frame-Options', value: headers.xFrameOptions },
    { name: 'X-Content-Type-Options', value: headers.xContentTypeOptions },
    { name: 'Referrer-Policy', value: headers.referrerPolicy },
    { name: 'Permissions-Policy', value: headers.permissionsPolicy },
  ];

  const present: string[] = [];
  const missing: string[] = [];

  for (const header of securityHeaders) {
    if (header.value) {
      present.push(header.name);
    } else {
      missing.push(header.name);
    }
  }

  const score = Math.round((present.length / securityHeaders.length) * 100);

  return { score, missing, present };
}
