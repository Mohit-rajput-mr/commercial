import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check for admin token
    const adminToken = request.headers.get('x-admin-token');
    
    if (adminToken !== 'admin-authenticated') {
      // Try regular Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    }

    // Get all statistics
    const [
      { count: totalProperties },
      { count: forLease },
      { count: forSale },
      { count: auctions },
      { count: totalUsers },
      { count: pendingChats },
      { data: recentActivities },
      { data: propertyTypes },
    ] = await Promise.all([
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'For Lease').eq('is_active', true),
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'For Sale').eq('is_active', true),
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'Auctions').eq('is_active', true),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('chats').select('*', { count: 'exact', head: true }).eq('status', 'active').gt('unread_count_admin', 0),
      supabaseAdmin.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('properties').select('property_type').eq('is_active', true),
    ]);

    // Calculate property type counts
    const typeCount: Record<string, number> = {};
    propertyTypes?.forEach((prop: any) => {
      typeCount[prop.property_type] = (typeCount[prop.property_type] || 0) + 1;
    });

    // Get property views for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: viewsData } = await supabaseAdmin
      .from('property_views')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Group views by day
    const viewsByDay: Record<string, number> = {};
    viewsData?.forEach((view: any) => {
      const day = new Date(view.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties: totalProperties || 0,
        forLease: forLease || 0,
        forSale: forSale || 0,
        auctions: auctions || 0,
        totalUsers: totalUsers || 0,
        pendingChats: pendingChats || 0,
      },
      propertyTypes: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
      recentActivities: recentActivities || [],
      viewsByDay,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

