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
    const period = searchParams.get('period') || 'all'; // 'today', 'week', 'month', 'year', 'all'

    // Calculate date filter based on period
    let dateFilter: Date | null = null;
    const now = new Date();
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
        dateFilter.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        dateFilter = new Date(now);
        dateFilter.setFullYear(now.getFullYear() - 1);
        break;
      default:
        dateFilter = null;
    }

    let query = supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
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

    return NextResponse.json({
      success: true,
      visitors: data || [],
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

