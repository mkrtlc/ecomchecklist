import { NextRequest, NextResponse } from 'next/server';
import { getAudit } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check if SSE is requested
  const acceptHeader = request.headers.get('accept');
  const wantsSSE = acceptHeader?.includes('text/event-stream');

  if (wantsSSE) {
    // Server-Sent Events for real-time updates
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          let lastProgress = -1;
          let completed = false;

          while (!completed) {
            const audit = await getAudit(id);

            if (!audit) {
              sendEvent({ error: 'Audit not found' });
              break;
            }

            // Only send update if progress changed
            if (audit.progress !== lastProgress || audit.status === 'completed' || audit.status === 'failed') {
              sendEvent({
                id: audit.id,
                status: audit.status,
                progress: audit.progress,
                currentCheck: audit.current_check,
                overallScore: audit.overall_score,
                errorMessage: audit.error_message,
              });
              lastProgress = audit.progress;
            }

            if (audit.status === 'completed' || audit.status === 'failed') {
              completed = true;
              break;
            }

            // Poll every second
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('SSE error:', error);
          sendEvent({ error: 'Stream error' });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Regular GET request
  try {
    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: audit.id,
      url: audit.url,
      status: audit.status,
      progress: audit.progress,
      currentCheck: audit.current_check,
      overallScore: audit.overall_score,
      platform: audit.platform,
      errorMessage: audit.error_message,
      startedAt: audit.started_at,
      completedAt: audit.completed_at,
      createdAt: audit.created_at,
    });
  } catch (error) {
    console.error('Error getting audit status:', error);
    return NextResponse.json(
      { error: 'Failed to get audit status' },
      { status: 500 }
    );
  }
}
