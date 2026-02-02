import { NextRequest, NextResponse } from 'next/server';
import { getAudit } from '@/lib/supabase';
import { runAudit } from '@/lib/audit/runner';
import { createAuditAdapterBundle } from '@/lib/adapters';
import { sendAuditReportEmail, isEmailEnabled } from '@/lib/email';

// This endpoint is called internally to run an audit
// It's designed to be called fire-and-forget from /api/audit/start

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auditId } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    // Get the audit from database
    const audit = await getAudit(auditId);
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Don't run if already processing or completed
    if (audit.status !== 'pending') {
      return NextResponse.json({
        message: `Audit is already ${audit.status}`,
        status: audit.status,
      });
    }

    // Create adapter bundle for this audit
    const adapters = createAuditAdapterBundle();

    // Run the audit
    const result = await runAudit({
      auditId,
      url: audit.url,
      adapters,
      onProgress: (progress, currentCheck) => {
        console.log(`Audit ${auditId}: ${progress}% - ${currentCheck}`);
      },
    });

    // If email was provided and audit succeeded, send the report
    if (result.success && audit.email && isEmailEnabled()) {
      const emailResult = await sendAuditReportEmail({
        to: audit.email,
        auditId,
        url: audit.url,
        overallScore: result.overallScore || 0,
        results: result.results,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://ecomchecklist.net',
      });

      if (!emailResult.success) {
        console.error('Failed to send audit report email:', emailResult.error);
      } else {
        console.log(`Audit report email sent to: ${audit.email}`);
      }
    }

    return NextResponse.json({
      success: result.success,
      overallScore: result.overallScore,
      platform: result.platform,
      checksRun: result.results.length,
      error: result.error,
    });
  } catch (error) {
    console.error('Error running audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Increase timeout for Vercel serverless functions
export const maxDuration = 60; // 60 seconds max for audit
