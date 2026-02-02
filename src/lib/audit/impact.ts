import type { AuditCheckDefinition, AuditCheckResult, Severity } from './types';

// Business impact categories - which aspects of the business each check affects
export type ImpactCategory =
  | 'conversion' // Directly impacts purchase completion
  | 'trust' // Affects customer trust and credibility
  | 'discovery' // Affects how customers find the store (SEO, etc.)
  | 'experience' // Affects user experience
  | 'compliance'; // Legal/regulatory requirements

// Impact weights for prioritization
const IMPACT_WEIGHTS: Record<ImpactCategory, number> = {
  conversion: 5,  // Highest priority - directly affects revenue
  trust: 4,       // Critical for e-commerce
  discovery: 3,   // Important for growth
  experience: 2,  // Affects retention
  compliance: 2,  // Must-haves but often not urgent
};

// Map check IDs to their business impact categories
const CHECK_IMPACT_MAP: Record<string, ImpactCategory[]> = {
  // Conversion-critical checks
  'guest-checkout': ['conversion'],
  'atc-above-fold': ['conversion'],
  'checkout-steps-count': ['conversion'],
  'clear-pricing': ['conversion', 'trust'],
  'payment-methods': ['conversion', 'trust'],
  'shipping-info': ['conversion'],
  'mobile-responsive': ['conversion', 'experience'],
  'mobile-page-speed': ['conversion', 'experience'],

  // Trust-critical checks
  'ssl-validation': ['trust', 'compliance'],
  'trust-badges': ['trust', 'conversion'],
  'reviews-display': ['trust', 'conversion'],
  'return-policy': ['trust', 'conversion'],
  'hsts-header': ['trust', 'compliance'],
  'https-redirect': ['trust'],
  'csp-headers': ['trust', 'compliance'],
  'cookie-security': ['trust', 'compliance'],

  // Discovery/SEO checks
  'meta-tags': ['discovery'],
  'structured-data': ['discovery'],
  'canonical-urls': ['discovery'],
  'robots-txt': ['discovery'],
  'sitemap-xml': ['discovery'],
  'og-tags': ['discovery'],

  // Performance/Experience checks
  'lcp-score': ['conversion', 'experience', 'discovery'],
  'cls-score': ['experience'],
  'inp-score': ['experience'],
  'image-optimization': ['experience', 'conversion'],
  'gzip-compression': ['experience'],
  'lazy-loading': ['experience'],
  'font-loading': ['experience'],
  'critical-css': ['experience'],
  'caching-headers': ['experience'],

  // UX checks
  'search-functionality': ['experience', 'conversion'],
  'filter-sort': ['experience', 'conversion'],
  'breadcrumbs': ['experience'],
  '404-handling': ['experience'],
  'product-zoom': ['experience', 'conversion'],
  'size-guide': ['conversion'],

  // Technical checks
  'broken-links': ['experience', 'discovery'],
  'redirect-chains': ['experience', 'discovery'],
  'minified-assets': ['experience'],
  'dns-prefetch': ['experience'],
  'third-party-scripts': ['experience'],
  'resource-hints': ['experience'],

  // Security/Compliance
  'mixed-content': ['trust', 'compliance'],
  'x-frame-options': ['compliance'],
  'content-type-options': ['compliance'],
  'referrer-policy': ['compliance'],
  'permissions-policy': ['compliance'],
  'product-image-quality': ['conversion', 'experience'],
  'urgency-elements': ['conversion'],
};

// Severity multiplier for impact score
const SEVERITY_MULTIPLIERS: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  nice: 1,
};

export interface ImpactScore {
  checkId: string;
  impactScore: number;
  impactCategories: ImpactCategory[];
  priorityLabel: 'immediate' | 'short-term' | 'long-term';
  estimatedRevenueImpact: 'high' | 'medium' | 'low';
}

export interface PrioritizedActionPlan {
  immediate: ImpactScore[]; // Fix this week
  shortTerm: ImpactScore[]; // Fix this month
  longTerm: ImpactScore[];  // Nice to have
}

export interface BusinessImpactSummary {
  totalIssues: number;
  criticalIssues: number;
  conversionIssues: number;
  trustIssues: number;
  estimatedRevenueAtRisk: 'high' | 'medium' | 'low';
  topPriorities: string[];
  actionPlan: PrioritizedActionPlan;
}

// Calculate impact score for a single check
export function calculateCheckImpact(
  checkId: string,
  status: 'pass' | 'warn' | 'fail',
  severity: Severity
): ImpactScore {
  // Get impact categories for this check
  const impactCategories = CHECK_IMPACT_MAP[checkId] || ['experience'];

  // Calculate base impact from categories
  const categoryImpact = impactCategories.reduce((sum, cat) => sum + IMPACT_WEIGHTS[cat], 0);

  // Apply severity multiplier
  const severityMultiplier = SEVERITY_MULTIPLIERS[severity];

  // Apply status modifier (only issues matter for prioritization)
  const statusModifier = status === 'fail' ? 1 : status === 'warn' ? 0.5 : 0;

  // Final impact score
  const impactScore = categoryImpact * severityMultiplier * statusModifier;

  // Determine priority label
  let priorityLabel: 'immediate' | 'short-term' | 'long-term';
  if (impactScore >= 15 || (severity === 'critical' && status === 'fail')) {
    priorityLabel = 'immediate';
  } else if (impactScore >= 8 || (severity === 'high' && status === 'fail')) {
    priorityLabel = 'short-term';
  } else {
    priorityLabel = 'long-term';
  }

  // Estimate revenue impact
  let estimatedRevenueImpact: 'high' | 'medium' | 'low';
  if (impactCategories.includes('conversion') && status === 'fail') {
    estimatedRevenueImpact = severity === 'critical' || severity === 'high' ? 'high' : 'medium';
  } else if (impactCategories.includes('trust') && status === 'fail') {
    estimatedRevenueImpact = 'medium';
  } else {
    estimatedRevenueImpact = 'low';
  }

  return {
    checkId,
    impactScore,
    impactCategories,
    priorityLabel,
    estimatedRevenueImpact,
  };
}

// Generate prioritized action plan from audit results
export function generateActionPlan(
  results: AuditCheckResult[],
  definitions: AuditCheckDefinition[]
): PrioritizedActionPlan {
  const defMap = new Map(definitions.map(d => [d.id, d]));

  const impactScores: ImpactScore[] = results
    .filter(r => r.status !== 'pass')
    .map(r => {
      const def = defMap.get(r.checkId);
      return calculateCheckImpact(
        r.checkId,
        r.status,
        def?.severity || 'medium'
      );
    })
    .sort((a, b) => b.impactScore - a.impactScore);

  return {
    immediate: impactScores.filter(s => s.priorityLabel === 'immediate'),
    shortTerm: impactScores.filter(s => s.priorityLabel === 'short-term'),
    longTerm: impactScores.filter(s => s.priorityLabel === 'long-term'),
  };
}

// Generate executive summary with business impact
export function generateBusinessImpactSummary(
  results: AuditCheckResult[],
  definitions: AuditCheckDefinition[]
): BusinessImpactSummary {
  const defMap = new Map(definitions.map(d => [d.id, d]));
  const actionPlan = generateActionPlan(results, definitions);

  // Count issues
  const failedChecks = results.filter(r => r.status === 'fail');
  const warnChecks = results.filter(r => r.status === 'warn');
  const totalIssues = failedChecks.length + warnChecks.length;

  // Count critical issues
  const criticalIssues = failedChecks.filter(r => {
    const def = defMap.get(r.checkId);
    return def?.severity === 'critical';
  }).length;

  // Count conversion-related issues
  const conversionIssues = failedChecks.filter(r => {
    const impacts = CHECK_IMPACT_MAP[r.checkId] || [];
    return impacts.includes('conversion');
  }).length;

  // Count trust-related issues
  const trustIssues = failedChecks.filter(r => {
    const impacts = CHECK_IMPACT_MAP[r.checkId] || [];
    return impacts.includes('trust');
  }).length;

  // Estimate overall revenue at risk
  let estimatedRevenueAtRisk: 'high' | 'medium' | 'low';
  if (criticalIssues > 0 || conversionIssues >= 3) {
    estimatedRevenueAtRisk = 'high';
  } else if (conversionIssues > 0 || trustIssues >= 2) {
    estimatedRevenueAtRisk = 'medium';
  } else {
    estimatedRevenueAtRisk = 'low';
  }

  // Get top priorities (titles)
  const topPriorities = actionPlan.immediate
    .slice(0, 5)
    .map(s => {
      const def = defMap.get(s.checkId);
      return def?.title || s.checkId;
    });

  return {
    totalIssues,
    criticalIssues,
    conversionIssues,
    trustIssues,
    estimatedRevenueAtRisk,
    topPriorities,
    actionPlan,
  };
}

// Format action plan for display
export function formatActionPlanText(
  actionPlan: PrioritizedActionPlan,
  definitions: AuditCheckDefinition[]
): string {
  const defMap = new Map(definitions.map(d => [d.id, d]));

  let output = '';

  if (actionPlan.immediate.length > 0) {
    output += 'IMMEDIATE (This Week):\n';
    actionPlan.immediate.forEach(item => {
      const def = defMap.get(item.checkId);
      const severity = def?.severity?.toUpperCase() || 'UNKNOWN';
      output += `  [${severity}] ${def?.title || item.checkId}\n`;
    });
    output += '\n';
  }

  if (actionPlan.shortTerm.length > 0) {
    output += 'SHORT-TERM (This Month):\n';
    actionPlan.shortTerm.forEach(item => {
      const def = defMap.get(item.checkId);
      const severity = def?.severity?.toUpperCase() || 'UNKNOWN';
      output += `  [${severity}] ${def?.title || item.checkId}\n`;
    });
    output += '\n';
  }

  if (actionPlan.longTerm.length > 0) {
    output += 'LONG-TERM (When Possible):\n';
    actionPlan.longTerm.forEach(item => {
      const def = defMap.get(item.checkId);
      const severity = def?.severity?.toUpperCase() || 'UNKNOWN';
      output += `  [${severity}] ${def?.title || item.checkId}\n`;
    });
  }

  return output;
}
