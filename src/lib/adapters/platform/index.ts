export type EcommercePlatform =
  | 'shopify'
  | 'woocommerce'
  | 'magento'
  | 'bigcommerce'
  | 'squarespace'
  | 'wix'
  | 'prestashop'
  | 'opencart'
  | 'volusion'
  | 'custom'
  | 'unknown';

export interface PlatformInfo {
  platform: EcommercePlatform;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
  raw?: unknown;
}

export interface PlatformAdapter {
  detectPlatform: (html: string, url?: string) => Promise<PlatformInfo>;
}

interface PlatformPattern {
  platform: EcommercePlatform;
  patterns: RegExp[];
  confidence: 'high' | 'medium' | 'low';
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: 'shopify',
    confidence: 'high',
    patterns: [
      /cdn\.shopify\.com/i,
      /Shopify\.theme/i,
      /myshopify\.com/i,
      /<meta[^>]*name="shopify-checkout-api-token"/i,
      /shopify-section/i,
      /\/\/cdn\.shopifycdn\.net/i,
    ],
  },
  {
    platform: 'woocommerce',
    confidence: 'high',
    patterns: [
      /woocommerce/i,
      /wc-add-to-cart/i,
      /wp-content\/plugins\/woocommerce/i,
      /class="woocommerce/i,
      /data-product_id/i,
    ],
  },
  {
    platform: 'magento',
    confidence: 'high',
    patterns: [
      /Magento/i,
      /mage\/cookies/i,
      /\/static\/version/i,
      /Mage\.Cookies/i,
      /\/skin\/frontend\//i,
      /magento-init/i,
    ],
  },
  {
    platform: 'bigcommerce',
    confidence: 'high',
    patterns: [
      /bigcommerce/i,
      /cdn\.bcapp\.com/i,
      /stencil-/i,
      /bigcommerce\.com\/api/i,
    ],
  },
  {
    platform: 'squarespace',
    confidence: 'high',
    patterns: [
      /squarespace/i,
      /static\.squarespace\.com/i,
      /sqs-block/i,
      /class="sqsrte/i,
    ],
  },
  {
    platform: 'wix',
    confidence: 'high',
    patterns: [
      /wix\.com/i,
      /static\.wixstatic\.com/i,
      /wix-warmup-data/i,
      /wixcode-sdk/i,
    ],
  },
  {
    platform: 'prestashop',
    confidence: 'high',
    patterns: [
      /prestashop/i,
      /modules\/blocktopmenu/i,
      /PrestaShop/i,
      /js\/theme\.js/i,
    ],
  },
  {
    platform: 'opencart',
    confidence: 'high',
    patterns: [
      /opencart/i,
      /catalog\/view\/theme/i,
      /route=product\/product/i,
      /route=checkout\/cart/i,
    ],
  },
  {
    platform: 'volusion',
    confidence: 'high',
    patterns: [
      /volusion/i,
      /vspfiles/i,
      /v\/vspfiles/i,
    ],
  },
];

export function createPlatformAdapter(): PlatformAdapter {
  return {
    async detectPlatform(html: string, url?: string): Promise<PlatformInfo> {
      const evidence: string[] = [];
      let detectedPlatform: EcommercePlatform = 'unknown';
      let highestConfidence: 'high' | 'medium' | 'low' = 'low';

      // Check URL patterns first
      if (url) {
        if (url.includes('myshopify.com') || url.includes('shopify.com')) {
          return {
            platform: 'shopify',
            confidence: 'high',
            evidence: ['URL contains Shopify domain'],
          };
        }
      }

      // Check HTML patterns
      for (const platformPattern of PLATFORM_PATTERNS) {
        for (const pattern of platformPattern.patterns) {
          if (pattern.test(html)) {
            evidence.push(`Found pattern: ${pattern.source}`);

            // If we found a high-confidence match, use it
            if (platformPattern.confidence === 'high') {
              return {
                platform: platformPattern.platform,
                confidence: 'high',
                evidence,
              };
            }

            // Track the best match so far
            if (
              detectedPlatform === 'unknown' ||
              (platformPattern.confidence === 'medium' && highestConfidence === 'low')
            ) {
              detectedPlatform = platformPattern.platform;
              highestConfidence = platformPattern.confidence;
            }
          }
        }
      }

      // Check for generic e-commerce indicators
      const genericEcommercePatterns = [
        /add[_-]?to[_-]?cart/i,
        /shopping[_-]?cart/i,
        /checkout/i,
        /product[_-]?price/i,
        /buy[_-]?now/i,
      ];

      let ecommerceIndicators = 0;
      for (const pattern of genericEcommercePatterns) {
        if (pattern.test(html)) {
          ecommerceIndicators++;
        }
      }

      if (detectedPlatform === 'unknown' && ecommerceIndicators >= 2) {
        detectedPlatform = 'custom';
        highestConfidence = 'medium';
        evidence.push(`Found ${ecommerceIndicators} generic e-commerce patterns`);
      }

      return {
        platform: detectedPlatform,
        confidence: highestConfidence,
        evidence: evidence.length > 0 ? evidence : ['No platform patterns detected'],
      };
    },
  };
}

// Helper to get platform display name
export function getPlatformDisplayName(platform: EcommercePlatform): string {
  const names: Record<EcommercePlatform, string> = {
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
    magento: 'Magento',
    bigcommerce: 'BigCommerce',
    squarespace: 'Squarespace',
    wix: 'Wix',
    prestashop: 'PrestaShop',
    opencart: 'OpenCart',
    volusion: 'Volusion',
    custom: 'Custom Platform',
    unknown: 'Unknown',
  };
  return names[platform] || 'Unknown';
}
