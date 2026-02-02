import { getResendClient, isEmailEnabled } from './resend';
import { renderAuditReportEmail } from './templates/audit-report';
import { CHECK_DEFINITIONS } from '../audit/checks/registry';
import type { AuditCheckResult } from '../audit/types';

interface SendReportEmailOptions {
  to: string;
  auditId: string;
  url: string;
  overallScore: number;
  results: AuditCheckResult[];
  baseUrl?: string;
}

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export async function sendAuditReportEmail(options: SendReportEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!isEmailEnabled()) {
    return { success: false, error: 'Email not configured (RESEND_API_KEY missing)' };
  }

  const { to, auditId, url, overallScore, results, baseUrl = 'https://ecomchecklist.net' } = options;

  // Get top issues (failed checks sorted by severity)
  const failedChecks = results
    .filter(r => r.status === 'fail')
    .map(r => {
      const def = CHECK_DEFINITIONS.find(d => d.id === r.checkId);
      return {
        title: def?.title || r.checkId,
        severity: def?.severity || 'medium',
        category: def?.category || 'other',
      };
    })
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, nice: 3 };
      return (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
             (severityOrder[b.severity as keyof typeof severityOrder] || 3);
    })
    .slice(0, 5); // Top 5 issues

  // Calculate summary
  const summary = {
    passed: results.filter(r => r.status === 'pass').length,
    warned: results.filter(r => r.status === 'warn').length,
    failed: results.filter(r => r.status === 'fail').length,
  };

  const grade = getGrade(overallScore);
  const reportUrl = `${baseUrl}/analyze?id=${auditId}`;

  // Render email HTML
  const html = renderAuditReportEmail({
    url,
    overallScore,
    grade,
    topIssues: failedChecks,
    summary,
    reportUrl,
  });

  try {
    const resend = getResendClient();

    const { error } = await resend.emails.send({
      from: 'EcomChecklist <reports@ecomchecklist.net>',
      to: [to],
      subject: `Your E-Commerce Audit Results: ${overallScore}/100 (Grade ${grade})`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
