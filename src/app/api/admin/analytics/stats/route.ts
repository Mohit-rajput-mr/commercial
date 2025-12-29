import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // 'today', 'week', 'month', 'year', 'all'

    // Calculate date filter
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

    // Get total visitors count
    let totalVisitorsQuery = supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true });
    if (dateFilter) {
      totalVisitorsQuery = totalVisitorsQuery.gte('created_at', dateFilter.toISOString());
    }
    const { count: totalVisitors } = await totalVisitorsQuery;

    // Get unique visitors (by session ID)
    let uniqueVisitorsQuery = supabaseAdmin.from('visitors').select('session_id');
    if (dateFilter) {
      uniqueVisitorsQuery = uniqueVisitorsQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: allVisitors } = await uniqueVisitorsQuery;
    const uniqueVisitors = new Set(allVisitors?.map(v => v.session_id)).size;

    // Get stats by country
    let countryQuery = supabaseAdmin.from('visitors').select('country, country_code').not('country', 'is', null);
    if (dateFilter) {
      countryQuery = countryQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: countryData } = await countryQuery;

    const countryCounts: Record<string, { count: number; code: string }> = {};
    countryData?.forEach((v) => {
      const key = v.country || 'Unknown';
      if (!countryCounts[key]) {
        countryCounts[key] = { count: 0, code: v.country_code || '' };
      }
      countryCounts[key].count += 1;
    });

    // Get stats by city
    let cityQuery = supabaseAdmin.from('visitors').select('city, country').not('city', 'is', null);
    if (dateFilter) {
      cityQuery = cityQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: cityData } = await cityQuery;

    const cityCounts: Record<string, number> = {};
    cityData?.forEach((v) => {
      const key = `${v.city}, ${v.country}`;
      cityCounts[key] = (cityCounts[key] || 0) + 1;
    });

    // Get device stats
    let deviceQuery = supabaseAdmin.from('visitors').select('device_type');
    if (dateFilter) {
      deviceQuery = deviceQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: deviceData } = await deviceQuery;

    const deviceCounts: Record<string, number> = {};
    deviceData?.forEach((v) => {
      const type = v.device_type || 'unknown';
      deviceCounts[type] = (deviceCounts[type] || 0) + 1;
    });

    // Get browser stats
    let browserQuery = supabaseAdmin.from('visitors').select('browser').not('browser', 'is', null);
    if (dateFilter) {
      browserQuery = browserQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: browserData } = await browserQuery;

    const browserCounts: Record<string, number> = {};
    browserData?.forEach((v) => {
      const browser = v.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    // Get OS stats
    let osQuery = supabaseAdmin.from('visitors').select('os').not('os', 'is', null);
    if (dateFilter) {
      osQuery = osQuery.gte('created_at', dateFilter.toISOString());
    }
    const { data: osData } = await osQuery;

    const osCounts: Record<string, number> = {};
    osData?.forEach((v) => {
      const os = v.os || 'Unknown';
      osCounts[os] = (osCounts[os] || 0) + 1;
    });

    // Get visitors over time (for chart - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: timeSeriesData } = await supabaseAdmin
      .from('visitors')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const visitorsByDate: Record<string, number> = {};
    timeSeriesData?.forEach((v) => {
      const date = new Date(v.created_at).toISOString().split('T')[0];
      visitorsByDate[date] = (visitorsByDate[date] || 0) + 1;
    });

    // Sort and format
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([country, data]) => ({ country, count: data.count, code: data.code }));

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([city, count]) => ({ city, count }));

    const topBrowsers = Object.entries(browserCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([browser, count]) => ({ browser, count }));

    const topOS = Object.entries(osCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([os, count]) => ({ os, count }));

    // Format time series data
    const timeSeries = Object.entries(visitorsByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      success: true,
      stats: {
        totalVisitors: totalVisitors || 0,
        uniqueVisitors,
        topCountries,
        topCities,
        deviceCounts,
        browserCounts: topBrowsers,
        osCounts: topOS,
        timeSeries,
      },
    });
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

