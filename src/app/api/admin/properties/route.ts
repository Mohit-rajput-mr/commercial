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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000');
    const search = searchParams.get('search') || '';

    // Build query - ADMIN CAN SEE ALL PROPERTIES (including inactive)
    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`address.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%,zip.ilike.%${search}%`);
    }

    // Apply limit
    query = query.limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      properties: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Admin properties fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






