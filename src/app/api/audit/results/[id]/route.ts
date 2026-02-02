import { NextRequest, NextResponse } from 'next/server';
import { getAuditWithChecks } from '@/lib/supabase';
import { CHECK_DEFINITIONS } from '@/lib/audit/checks/registry';
import { computeAuditScore } from '@/lib/audit/scoring';
import { generateBusinessImpactSummary } from '@/lib/audit/impact';
import type { AuditCheckResult } from '@/lib/audit/types';

// Helper to convert score to letter grade
function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  performance: 'Performance',
  security: 'Security',
  conversion: 'Conversion',
  seo: 'SEO',
  accessibility: 'Accessibility',
  ux: 'User Experience',
  content: 'Content',
  analytics: 'Analytics',
  technical: 'Technical',
  other: 'Other',
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const result = await getAuditWithChecks(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    const { audit, checks } = result;

    // Only return results for completed audits
    if (audit.status !== 'completed') {
      return NextResponse.json({
        id: audit.id,
        status: audit.status,
        progress: audit.progress,
        message: audit.status === 'failed'
          ? `Audit failed: ${audit.error_message}`
          : 'Audit is still in progress',
      });
    }

    // Convert database results to AuditCheckResult format
    const checkResults: AuditCheckResult[] = checks.map(check => ({
      checkId: check.check_id,
      status: check.status,
      evidence: (check.evidence as { evidence?: string[] })?.evidence,
      urlsTested: (check.evidence as { urlsTested?: string[] })?.urlsTested,
    }));

    // Calculate scores
    const score = computeAuditScore({
      definitions: CHECK_DEFINITIONS,
      results: checkResults,
    });

    // Build response with full details
    const response = {
      id: audit.id,
      url: audit.url,
      status: audit.status,
      platform: audit.platform,
      screenshotUrl: (audit as { screenshot_url?: string }).screenshot_url || null,
      auditedAt: audit.completed_at,
      createdAt: audit.created_at,

      // Scores
      overallScore: score.overall.score0to100,
      grade: getGrade(score.overall.score0to100),
      categoryScores: score.byCategory.map(cat => {
        const categoryChecks = checkResults.filter(r => {
          const def = CHECK_DEFINITIONS.find(d => d.id === r.checkId);
          return def?.category === cat.category;
        });
        return {
          category: cat.category,
          label: CATEGORY_LABELS[cat.category] || cat.category,
          score: cat.score0to100,
          grade: getGrade(cat.score0to100),
          passed: categoryChecks.filter(c => c.status === 'pass').length,
          warned: categoryChecks.filter(c => c.status === 'warn').length,
          failed: categoryChecks.filter(c => c.status === 'fail').length,
          total: categoryChecks.length,
        };
      }),

      // Check results with definitions
      checks: checkResults.map(result => {
        const definition = CHECK_DEFINITIONS.find(d => d.id === result.checkId);
        return {
          id: result.checkId,
          title: definition?.title || result.checkId,
          category: definition?.category || 'other',
          severity: definition?.severity || 'medium',
          status: result.status,
          evidence: result.evidence,
          urlsTested: result.urlsTested,
          whyImportant: definition?.whyImportant,
          howToFix: definition?.howToFix,
          references: definition?.references,
        };
      }),

      // Summary stats
      summary: {
        total: checkResults.length,
        passed: checkResults.filter(c => c.status === 'pass').length,
        warned: checkResults.filter(c => c.status === 'warn').length,
        failed: checkResults.filter(c => c.status === 'fail').length,
      },

      // Business impact analysis
      businessImpact: generateBusinessImpactSummary(checkResults, CHECK_DEFINITIONS),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting audit results:', error);
    return NextResponse.json(
      { error: 'Failed to get audit results' },
      { status: 500 }
    );
  }
}
