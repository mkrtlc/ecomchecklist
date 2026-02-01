import { createRegistry } from "../registry";
import type { AuditRegistry } from "../registry";
import type { AuditCheckDefinition } from "../types";

import { mobilePageSpeedCheck } from "./mobile-page-speed";
import { sslValidationCheck } from "./ssl-validation";
import { checkoutStepsCountCheck } from "./checkout-steps-count";
import { guestCheckoutCheck } from "./guest-checkout";
import { atcAboveFoldCheck } from "./atc-above-fold";
import { productImageQualityCheck } from "./product-image-quality";

// Batch 1: Security + Performance
import { httpsRedirectCheck } from "./https-redirect";
import { mixedContentCheck } from "./mixed-content";
import { cspHeadersCheck } from "./csp-headers";
import { cookieSecurityCheck } from "./cookie-security";
import { lcpScoreCheck } from "./lcp-score";
import { clsScoreCheck } from "./cls-score";
import { inpScoreCheck } from "./inp-score";
import { imageOptimizationCheck } from "./image-optimization";
import { cachingHeadersCheck } from "./caching-headers";

// Batch 2: SEO
import { metaTagsCheck } from "./meta-tags";
import { structuredDataCheck } from "./structured-data";
import { canonicalUrlsCheck } from "./canonical-urls";
import { robotsTxtCheck } from "./robots-txt";
import { sitemapXmlCheck } from "./sitemap-xml";
import { ogTagsCheck } from "./og-tags";

// Batch 3: Conversion
import { trustBadgesCheck } from "./trust-badges";
import { reviewsDisplayCheck } from "./reviews-display";
import { urgencyElementsCheck } from "./urgency-elements";
import { clearPricingCheck } from "./clear-pricing";
import { shippingInfoCheck } from "./shipping-info";
import { paymentMethodsCheck } from "./payment-methods";
import { returnPolicyCheck } from "./return-policy";

/**
 * Central registry for all audit checks.
 *
 * As we add the 50-item audit checklist, each check should register its definition here.
 */
export const CHECKS = [
  // Original 6
  mobilePageSpeedCheck,
  sslValidationCheck,
  checkoutStepsCountCheck,
  guestCheckoutCheck,
  atcAboveFoldCheck,
  productImageQualityCheck,
  // Batch 1: Security + Performance (9 new)
  httpsRedirectCheck,
  mixedContentCheck,
  cspHeadersCheck,
  cookieSecurityCheck,
  lcpScoreCheck,
  clsScoreCheck,
  inpScoreCheck,
  imageOptimizationCheck,
  cachingHeadersCheck,
  // Batch 2: SEO (6 new)
  metaTagsCheck,
  structuredDataCheck,
  canonicalUrlsCheck,
  robotsTxtCheck,
  sitemapXmlCheck,
  ogTagsCheck,
  // Batch 3: Conversion (7 new)
  trustBadgesCheck,
  reviewsDisplayCheck,
  urgencyElementsCheck,
  clearPricingCheck,
  shippingInfoCheck,
  paymentMethodsCheck,
  returnPolicyCheck,
];

export const CHECK_DEFINITIONS: AuditCheckDefinition[] = CHECKS.map((c) => c.definition);

export function createDefaultAuditRegistry(): AuditRegistry {
  return createRegistry(CHECK_DEFINITIONS);
}
