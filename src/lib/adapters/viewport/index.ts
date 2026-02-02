export interface ViewportAnalysis {
  aboveFold: boolean;
  evidence?: string[];
  raw?: unknown;
}

export interface ViewportAdapter {
  isAddToCartAboveFold: (
    url: string,
    opts?: { viewportWidth?: number; viewportHeight?: number }
  ) => Promise<ViewportAnalysis>;
}

// Static HTML analysis for add-to-cart button position
// This is a fallback when Browserless is not available
export function createStaticViewportAdapter(htmlAdapter: {
  fetchHtml: (url: string) => Promise<{ html: string }>;
}): ViewportAdapter {
  return {
    async isAddToCartAboveFold(
      url: string,
      _opts?: { viewportWidth?: number; viewportHeight?: number }
    ): Promise<ViewportAnalysis> {
      try {
        const { html } = await htmlAdapter.fetchHtml(url);

        // Look for add-to-cart button patterns
        const atcPatterns = [
          /add[_\-\s]?to[_\-\s]?cart/i,
          /buy[_\-\s]?now/i,
          /class="[^"]*add-to-cart[^"]*"/i,
          /id="[^"]*add-to-cart[^"]*"/i,
          /data-action="add-to-cart"/i,
          /type="submit"[^>]*add/i,
        ];

        let foundAtc = false;
        for (const pattern of atcPatterns) {
          if (pattern.test(html)) {
            foundAtc = true;
            break;
          }
        }

        if (!foundAtc) {
          return {
            aboveFold: false,
            evidence: ['No add-to-cart button pattern found in HTML'],
            raw: { method: 'static-analysis' },
          };
        }

        // Try to estimate position based on HTML structure
        // This is a heuristic - proper analysis requires Browserless
        const htmlLower = html.toLowerCase();

        // Find first occurrence of ATC pattern
        const atcMatches = [
          htmlLower.indexOf('add-to-cart'),
          htmlLower.indexOf('add_to_cart'),
          htmlLower.indexOf('addtocart'),
          htmlLower.indexOf('buy-now'),
          htmlLower.indexOf('buy_now'),
        ].filter(i => i !== -1);

        if (atcMatches.length === 0) {
          return {
            aboveFold: false,
            evidence: ['Could not locate add-to-cart element in HTML'],
            raw: { method: 'static-analysis' },
          };
        }

        const firstAtcPosition = Math.min(...atcMatches);
        const htmlLength = html.length;
        const positionRatio = firstAtcPosition / htmlLength;

        // Heuristic: if ATC appears in first 40% of HTML, likely above fold
        // This is imperfect but better than nothing without browser rendering
        const likelyAboveFold = positionRatio < 0.4;

        return {
          aboveFold: likelyAboveFold,
          evidence: [
            `Add-to-cart found at ~${Math.round(positionRatio * 100)}% through HTML`,
            likelyAboveFold
              ? 'Likely above fold (heuristic estimate)'
              : 'Likely below fold (heuristic estimate)',
            'Note: Accurate measurement requires browser rendering',
          ],
          raw: {
            method: 'static-analysis',
            positionRatio,
            firstAtcPosition,
            htmlLength,
          },
        };
      } catch (error) {
        return {
          aboveFold: false,
          evidence: [`Error analyzing page: ${error instanceof Error ? error.message : 'Unknown'}`],
          raw: { error: true },
        };
      }
    },
  };
}

// Browserless-based viewport adapter (implemented in Phase 3)
// This will be the preferred adapter when browser quota is available
export interface BrowserlessConfig {
  apiKey: string;
  endpoint?: string;
}

export async function createBrowserlessViewportAdapter(
  config: BrowserlessConfig
): Promise<ViewportAdapter | null> {
  // Validate connection to Browserless
  try {
    const endpoint = config.endpoint || 'https://chrome.browserless.io';
    const response = await fetch(`${endpoint}/pressure?token=${config.apiKey}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.warn('Browserless connection failed, falling back to static analysis');
      return null;
    }

    // Return browser-based adapter
    return {
      async isAddToCartAboveFold(
        url: string,
        opts?: { viewportWidth?: number; viewportHeight?: number }
      ): Promise<ViewportAnalysis> {
        const width = opts?.viewportWidth || 375; // Mobile default
        const height = opts?.viewportHeight || 667;

        const script = `
          async function analyze() {
            const atcSelectors = [
              '[class*="add-to-cart"]',
              '[class*="add_to_cart"]',
              '[id*="add-to-cart"]',
              '[id*="add_to_cart"]',
              '[data-action="add-to-cart"]',
              'button:contains("Add to Cart")',
              'button:contains("Buy Now")',
              '.product-form__submit',
              '.btn-addtocart',
            ];

            for (const selector of atcSelectors) {
              try {
                const el = document.querySelector(selector);
                if (el) {
                  const rect = el.getBoundingClientRect();
                  const aboveFold = rect.top < ${height} && rect.bottom > 0;
                  return {
                    aboveFold,
                    top: rect.top,
                    bottom: rect.bottom,
                    selector,
                  };
                }
              } catch (e) {}
            }
            return { aboveFold: false, notFound: true };
          }
          analyze();
        `;

        const response = await fetch(
          `${config.endpoint || 'https://chrome.browserless.io'}/function?token=${config.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: script,
              context: {
                url,
                viewport: { width, height },
                waitForSelector: 'body',
                timeout: 15000,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Browserless error: ${response.status}`);
        }

        const result = await response.json();

        return {
          aboveFold: result.aboveFold || false,
          evidence: result.notFound
            ? ['Add-to-cart button not found']
            : [
                `Button found at Y: ${Math.round(result.top)}px`,
                result.aboveFold
                  ? `Above fold (viewport: ${height}px)`
                  : `Below fold (viewport: ${height}px)`,
              ],
          raw: { ...result, method: 'browserless' },
        };
      },
    };
  } catch (error) {
    console.warn('Failed to create Browserless adapter:', error);
    return null;
  }
}
