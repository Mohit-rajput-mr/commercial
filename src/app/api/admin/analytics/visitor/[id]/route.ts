import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get visitor details
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('id', id)
      .single();

    if (visitorError || !visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Get all page visits for this visitor
    const { data: pageVisits, error: visitsError } = await supabaseAdmin
      .from('visitor_page_visits')
      .select('*')
      .eq('visitor_id', id)
      .order('visited_at', { ascending: false });

    // Get all link clicks for this visitor
    const { data: linkClicks, error: clicksError } = await supabaseAdmin
      .from('visitor_link_clicks')
      .select('*')
      .eq('visitor_id', id)
      .order('clicked_at', { ascending: false });

    // Calculate total time spent
    const totalTimeSpent = pageVisits?.reduce((sum, visit) => sum + (visit.time_spent_seconds || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      visitor: {
        ...visitor,
        pageVisits: pageVisits || [],
        linkClicks: linkClicks || [],
        totalTimeSpent,
        totalPagesVisited: pageVisits?.length || 0,
        totalLinksClicked: linkClicks?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching visitor details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


