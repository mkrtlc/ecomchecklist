import { NextRequest, NextResponse } from 'next/server';
import { createAudit } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, email } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Basic URL validation
    let normalizedUrl: string;
    try {
      // Add protocol if missing
      let urlToValidate = url.trim();
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = 'https://' + urlToValidate;
      }
      const parsed = new URL(urlToValidate);
      normalizedUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Create audit in database
    const audit = await createAudit({
      url: normalizedUrl,
      email: email || null,
      status: 'pending',
      progress: 0,
    });

    // Trigger the audit execution in background
    // We use waitUntil to run this after the response is sent
    const runUrl = new URL('/api/audit/run', request.url);

    // Fire and forget - trigger the audit runner
    fetch(runUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId: audit.id }),
    }).catch(err => {
      console.error('Failed to trigger audit run:', err);
    });

    return NextResponse.json({
      id: audit.id,
      url: audit.url,
      status: audit.status,
    });
  } catch (error) {
    console.error('Error starting audit:', error);
    return NextResponse.json(
      { error: 'Failed to start audit' },
      { status: 500 }
    );
  }
}
