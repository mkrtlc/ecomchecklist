import * as React from 'react';

interface AuditReportEmailProps {
  url: string;
  overallScore: number;
  grade: string;
  topIssues: Array<{
    title: string;
    severity: string;
    category: string;
  }>;
  summary: {
    passed: number;
    warned: number;
    failed: number;
  };
  reportUrl: string;
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#84cc16';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    default: return severity.toUpperCase();
  }
}

export function AuditReportEmail({
  url,
  overallScore,
  grade,
  topIssues,
  summary,
  reportUrl,
}: AuditReportEmailProps): React.ReactElement {
  const gradeColor = getGradeColor(grade);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your E-Commerce Audit Report</title>
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.6,
        color: '#1f2937',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9fafb',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0',
          }}>
            Your E-Commerce Audit Results
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
          }}>
            {url}
          </p>
        </div>

        {/* Score Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: gradeColor,
            marginBottom: '8px',
          }}>
            {overallScore}
          </div>
          <div style={{
            display: 'inline-block',
            backgroundColor: gradeColor,
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '4px 16px',
            borderRadius: '20px',
            marginBottom: '16px',
          }}>
            Grade: {grade}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '16px',
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
                {summary.passed}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Passed</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eab308' }}>
                {summary.warned}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Warnings</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {summary.failed}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Failed</div>
            </div>
          </div>
        </div>

        {/* Top Issues */}
        {topIssues.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 16px 0',
            }}>
              Top Issues to Fix
            </h2>
            {topIssues.map((issue, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 0',
                  borderBottom: index < topIssues.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'high' ? '#f97316' : '#6b7280',
                    backgroundColor: issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'high' ? '#fff7ed' : '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {getSeverityBadge(issue.severity)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>
                    {issue.category}
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                }}>
                  {issue.title}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a
            href={reportUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '14px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            View Full Report
          </a>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '24px',
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            This report was generated by EcomChecklist
          </p>
          <p style={{ margin: 0 }}>
            Questions? Reply to this email for support.
          </p>
        </div>
      </body>
    </html>
  );
}

export function renderAuditReportEmail(props: AuditReportEmailProps): string {
  // Simple HTML rendering without React SSR for email
  const gradeColor = getGradeColor(props.grade);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your E-Commerce Audit Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">Your E-Commerce Audit Results</h1>
    <p style="font-size: 14px; color: #6b7280; margin: 0;">${props.url}</p>
  </div>

  <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="font-size: 64px; font-weight: bold; color: ${gradeColor}; margin-bottom: 8px;">${props.overallScore}</div>
    <div style="display: inline-block; background-color: ${gradeColor}; color: #ffffff; font-size: 20px; font-weight: bold; padding: 4px 16px; border-radius: 20px; margin-bottom: 16px;">Grade: ${props.grade}</div>
    <table style="width: 100%; margin-top: 16px;">
      <tr>
        <td style="text-align: center; padding: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${props.summary.passed}</div>
          <div style="font-size: 12px; color: #6b7280;">Passed</div>
        </td>
        <td style="text-align: center; padding: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #eab308;">${props.summary.warned}</div>
          <div style="font-size: 12px; color: #6b7280;">Warnings</div>
        </td>
        <td style="text-align: center; padding: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${props.summary.failed}</div>
          <div style="font-size: 12px; color: #6b7280;">Failed</div>
        </td>
      </tr>
    </table>
  </div>

  ${props.topIssues.length > 0 ? `
  <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="font-size: 18px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">Top Issues to Fix</h2>
    ${props.topIssues.map((issue, index) => `
    <div style="padding: 12px 0; ${index < props.topIssues.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
      <div style="margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: bold; color: ${issue.severity === 'critical' ? '#ef4444' : issue.severity === 'high' ? '#f97316' : '#6b7280'}; background-color: ${issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'high' ? '#fff7ed' : '#f3f4f6'}; padding: 2px 6px; border-radius: 4px;">${getSeverityBadge(issue.severity)}</span>
        <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; margin-left: 8px;">${issue.category}</span>
      </div>
      <div style="font-size: 14px; color: #374151;">${issue.title}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${props.reportUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Full Report</a>
  </div>

  <div style="text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px;">
    <p style="margin: 0 0 8px 0;">This report was generated by EcomChecklist</p>
    <p style="margin: 0;">Questions? Reply to this email for support.</p>
  </div>
</body>
</html>
  `.trim();
}
