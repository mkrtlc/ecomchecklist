import { CHECKS } from './checks/registry';
import type { CheckAdapterBundle, CheckContext } from './checks/types';
import type { AuditCheckResult } from './types';
import {
  startAudit,
  completeAudit,
  failAudit,
  updateAuditProgress,
  saveCheckResults,
} from '../supabase/audits';
import { computeAuditScore } from './scoring';
import { CHECK_DEFINITIONS } from './checks/registry';

export interface RunAuditOptions {
  auditId: string;
  url: string;
  adapters: CheckAdapterBundle;
  onProgress?: (progress: number, currentCheck: string) => void;
}

export interface AuditRunResult {
  success: boolean;
  overallScore?: number;
  platform?: string;
  results: AuditCheckResult[];
  error?: string;
}

export async function runAudit(options: RunAuditOptions): Promise<AuditRunResult> {
  const { auditId, url, adapters, onProgress } = options;
  const results: AuditCheckResult[] = [];

  try {
    // Mark audit as started
    await startAudit(auditId);

    const ctx: CheckContext = { url };
    const totalChecks = CHECKS.length;

    // Run each check
    for (let i = 0; i < CHECKS.length; i++) {
      const check = CHECKS[i];
      const progress = Math.round(((i + 1) / totalChecks) * 100);

      try {
        // Update progress
        await updateAuditProgress(auditId, progress, check.definition.title);
        onProgress?.(progress, check.definition.title);

        // Run the check with a timeout
        const result = await Promise.race([
          check.run(ctx, adapters),
          new Promise<AuditCheckResult>((_, reject) =>
            setTimeout(() => reject(new Error('Check timeout')), 30000)
          ),
        ]);

        results.push(result);
      } catch (error) {
        // Individual check failure - record as warn and continue
        console.error(`Check ${check.definition.id} failed:`, error);
        results.push({
          checkId: check.definition.id,
          status: 'warn',
          evidence: [`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        });
      }
    }

    // Save all check results to database
    await saveCheckResults(
      results.map(r => ({
        audit_id: auditId,
        check_id: r.checkId,
        status: r.status,
        evidence: {
          evidence: r.evidence,
          urlsTested: r.urlsTested,
        },
      }))
    );

    // Calculate overall score
    const score = computeAuditScore({
      definitions: CHECK_DEFINITIONS,
      results,
    });

    // Detect platform if adapter is available
    let platform: string | undefined;
    if (adapters.platform && adapters.html) {
      try {
        const { html } = await adapters.html.fetchHtml(url);
        const platformInfo = await adapters.platform.detectPlatform(html, url);
        if (platformInfo.platform !== 'unknown') {
          platform = platformInfo.platform;
        }
      } catch {
        // Platform detection is not critical
      }
    }

    // Mark audit as complete
    await completeAudit(auditId, score.overall.score0to100, platform);

    return {
      success: true,
      overallScore: score.overall.score0to100,
      platform,
      results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Audit failed:', error);

    // Mark audit as failed
    await failAudit(auditId, errorMessage);

    return {
      success: false,
      results,
      error: errorMessage,
    };
  }
}
