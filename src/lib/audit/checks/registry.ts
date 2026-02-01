import { createRegistry } from "../registry";
import type { AuditRegistry } from "../registry";
import type { AuditCheckDefinition } from "../types";

import { mobilePageSpeedCheck } from "./mobile-page-speed";
import { sslValidationCheck } from "./ssl-validation";
import { checkoutStepsCountCheck } from "./checkout-steps-count";

/**
 * Central registry for all audit checks.
 *
 * As we add the 50-item audit checklist, each check should register its definition here.
 */
export const CHECKS = [mobilePageSpeedCheck, sslValidationCheck, checkoutStepsCountCheck];

export const CHECK_DEFINITIONS: AuditCheckDefinition[] = CHECKS.map((c) => c.definition);

export function createDefaultAuditRegistry(): AuditRegistry {
  return createRegistry(CHECK_DEFINITIONS);
}
