import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeUrlServer } from '@/lib/url-normalizer';

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and sendBeacon (Blob) requests
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle sendBeacon (Blob or text)
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        // If parsing fails, try to get as array buffer and convert
        const arrayBuffer = await request.arrayBuffer();
        const decoder = new TextDecoder();
        const textData = decoder.decode(arrayBuffer);
        body = JSON.parse(textData);
      }
    }
    
    let { sessionId, pageUrl, pageTitle, referrer, timeSpent } = body;

    if (!sessionId || !pageUrl) {
      return NextResponse.json({ error: 'Session ID and page URL required' }, { status: 400 });
    }

    // Normalize URLs to use production domain
    pageUrl = normalizeUrlServer(pageUrl);
    referrer = referrer ? normalizeUrlServer(referrer) : null;

    // Find the visitor by session ID
    const { data: visitor } = await supabaseAdmin
      .from('visitors')
      .select('id')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    // Check if there's a recent page visit for this page (within last 30 seconds)
    // If timeSpent > 0, it means we're updating time spent, so find the most recent visit to this page
    if (timeSpent > 0) {
      const { data: recentVisit } = await supabaseAdmin
        .from('visitor_page_visits')
        .select('id')
        .eq('visitor_id', visitor.id)
        .eq('session_id', sessionId)
        .eq('page_url', pageUrl)
        .order('visited_at', { ascending: false })
        .limit(1)
        .single();

      if (recentVisit) {
        // Update the time spent for the existing visit
        const { error: updateError } = await supabaseAdmin
          .from('visitor_page_visits')
          .update({
            time_spent_seconds: timeSpent,
          })
          .eq('id', recentVisit.id);

        if (updateError) {
          console.error('Error updating page visit:', updateError);
        }
        return NextResponse.json({ success: true, updated: true });
      }
    }

    // Insert new page visit (for new page or initial visit with 0 time)
    const { error } = await supabaseAdmin
      .from('visitor_page_visits')
      .insert({
        visitor_id: visitor.id,
        session_id: sessionId,
        page_url: pageUrl,
        page_title: pageTitle || null,
        referrer: referrer || null,
        time_spent_seconds: timeSpent || 0,
      });

    if (error) {
      console.error('Error tracking page visit:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-page-visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

