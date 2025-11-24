import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check for admin token
    const adminToken = request.headers.get('x-admin-token');
    
    if (adminToken === 'admin-authenticated') {
      // Admin authenticated via localStorage
      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          total_favorites:favorites(count),
          total_inquiries:inquiries(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Format the data
      const formattedUsers = data.map((user: any) => ({
        ...user,
        total_favorites: user.total_favorites?.[0]?.count || 0,
        total_inquiries: user.total_inquiries?.[0]?.count || 0,
      }));

      return NextResponse.json({
        success: true,
        users: formattedUsers,
      });
    }

    // Regular Supabase auth
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

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      users: data,
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

