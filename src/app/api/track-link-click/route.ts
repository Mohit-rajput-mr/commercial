import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeUrlServer } from '@/lib/url-normalizer';

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and sendBeacon (text/plain) requests
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle sendBeacon (text/plain)
      const text = await request.text();
      body = JSON.parse(text);
    }
    
    let { sessionId, linkUrl, linkText } = body;

    if (!sessionId || !linkUrl) {
      return NextResponse.json({ error: 'Session ID and link URL required' }, { status: 400 });
    }

    // Normalize URL to use production domain
    linkUrl = normalizeUrlServer(linkUrl);

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

    // Insert link click
    const { error } = await supabaseAdmin
      .from('visitor_link_clicks')
      .insert({
        visitor_id: visitor.id,
        session_id: sessionId,
        link_url: linkUrl,
        link_text: linkText || null,
      });

    if (error) {
      console.error('Error tracking link click:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-link-click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

