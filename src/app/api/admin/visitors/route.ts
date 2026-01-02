import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const excludeAdmin = searchParams.get('excludeAdmin') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all visitors
    const { data: allVisitors, error: fetchError } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .order('last_visit_at', { ascending: false })
      .limit(limit * 2); // Get more to filter

    if (fetchError) {
      console.error('Error fetching visitors:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Separate admin visits from regular visitors
    const recentVisitors: any[] = [];
    const adminVisits: any[] = [];

    for (const visitor of allVisitors || []) {
      // Check if visitor has admin page visits
      const { data: pageVisits } = await supabaseAdmin
        .from('visitor_page_visits')
        .select('page_url')
        .eq('visitor_id', visitor.id);

      // Check if any page visit is to admin pages
      const hasAdminVisit = pageVisits?.some(visit => {
        const url = visit.page_url?.toLowerCase() || '';
        return url.includes('/admin') || url.includes('admin');
      }) || visitor.page_url?.toLowerCase().includes('/admin') || visitor.page_url?.toLowerCase().includes('admin');

      if (hasAdminVisit) {
        adminVisits.push(visitor);
      } else {
        recentVisitors.push(visitor);
      }
    }

    // Calculate average time spent for recent visitors only (excluding admin)
    const recentVisitorsWithTime = await Promise.all(
      recentVisitors.slice(0, limit).map(async (visitor) => {
        const { data: pageVisits } = await supabaseAdmin
          .from('visitor_page_visits')
          .select('time_spent_seconds, page_url')
          .eq('visitor_id', visitor.id);

        // Filter out admin page visits from time calculation
        const nonAdminVisits = pageVisits?.filter(visit => 
          !visit.page_url?.includes('/admin') && !visit.page_url?.includes('admin')
        ) || [];

        const totalTimeSpent = nonAdminVisits.reduce((sum, visit) => sum + (visit.time_spent_seconds || 0), 0);
        const visitCount = nonAdminVisits.length;
        const averageTimeSpent = visitCount > 0 ? Math.round(totalTimeSpent / visitCount) : 0;

        return {
          ...visitor,
          averageTimeSpent,
        };
      })
    );

    // Limit admin visits
    const limitedAdminVisits = adminVisits.slice(0, Math.ceil(limit * 0.2)); // 20% of limit

    return NextResponse.json({
      success: true,
      recentVisitors: recentVisitorsWithTime,
      adminVisits: limitedAdminVisits,
      totalRecent: recentVisitors.length,
      totalAdmin: adminVisits.length,
    });
  } catch (error) {
    console.error('Error in visitors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

