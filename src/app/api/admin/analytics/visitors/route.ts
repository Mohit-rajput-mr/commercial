import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const deviceType = searchParams.get('deviceType');
    const period = searchParams.get('period') || 'all'; // 'today', 'week', 'month', '90days', 'year', 'all', 'custom'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date filter based on period
    let dateFilter: Date | null = null;
    let endDateFilter: Date | null = null;
    const now = new Date();
    
    if (period === 'custom' && startDate && endDate) {
      dateFilter = new Date(startDate);
      endDateFilter = new Date(endDate);
      // Set end date to end of day
      endDateFilter.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'today':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateFilter = new Date(now);
          dateFilter.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateFilter = new Date(now);
          dateFilter.setDate(now.getDate() - 30);
          break;
        case '90days':
          dateFilter = new Date(now);
          dateFilter.setDate(now.getDate() - 90);
          break;
        case 'year':
          dateFilter = new Date(now);
          dateFilter.setFullYear(now.getFullYear() - 1);
          break;
        default:
          dateFilter = null;
      }
    }

    let query = supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact' })
      .order('last_visit_at', { ascending: false }); // Sort by most recent visit time

    // Apply filters - filter by last visit time, not creation time
    if (dateFilter) {
      query = query.gte('last_visit_at', dateFilter.toISOString());
    }
    if (endDateFilter) {
      query = query.lte('last_visit_at', endDateFilter.toISOString());
    }

    if (country) {
      query = query.eq('country', country);
    }

    if (city) {
      query = query.eq('city', city);
    }

    if (deviceType) {
      query = query.eq('device_type', deviceType);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching visitors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate average time spent for each visitor (excluding admin visits)
    const visitorsWithTimeSpent = await Promise.all(
      (data || []).map(async (visitor) => {
        // Get all page visits for this visitor
        const { data: pageVisits } = await supabaseAdmin
          .from('visitor_page_visits')
          .select('time_spent_seconds, page_url')
          .eq('visitor_id', visitor.id);

        // Filter out admin page visits
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

    return NextResponse.json({
      success: true,
      visitors: visitorsWithTimeSpent,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in visitors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

