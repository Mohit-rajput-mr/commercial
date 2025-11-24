import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const status = searchParams.get('status') || '';
    const propertyType = searchParams.get('type') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Use supabaseAdmin to bypass RLS policies for public property listing
    // This allows anyone to view active properties without authentication
    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (search) {
      // Clean and normalize search term
      const cleanSearch = search.trim();
      if (cleanSearch.length > 0) {
        // Use case-insensitive search across multiple fields
        query = query.or(`address.ilike.%${cleanSearch}%,city.ilike.%${cleanSearch}%,state.ilike.%${cleanSearch}%,zip.ilike.%${cleanSearch}%`);
      }
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log(`📊 Properties API: Found ${count || 0} active properties`);
    if (count === 0) {
      // Check if there are any properties at all (including inactive)
      const { count: totalCount } = await supabaseAdmin
        .from('properties')
        .select('*', { count: 'exact', head: true });
      console.log(`📊 Total properties in database (including inactive): ${totalCount || 0}`);
      
      if (totalCount && totalCount > 0) {
        console.warn('⚠️ Properties exist but none are marked as active. Check is_active column.');
      }
    }

    return NextResponse.json({
      success: true,
      properties: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Properties fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for admin token in headers
    const adminToken = request.headers.get('x-admin-token');
    
    if (adminToken === 'admin-authenticated') {
      // Admin is authenticated via localStorage
      // Create property with admin privileges
      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert({
          ...body,
          created_by: null, // Admin created
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Log activity
      await supabaseAdmin.from('activities').insert({
        user_id: null,
        property_id: data.id,
        activity_type: 'property_added',
        description: `Property added by admin: ${data.address}, ${data.city}, ${data.state}`,
      });

      return NextResponse.json({
        success: true,
        property: data,
      });
    }

    // Regular user authentication
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

    // Create property
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        ...body,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      property_id: data.id,
      activity_type: 'property_added',
      description: `Property added: ${data.address}, ${data.city}, ${data.state}`,
    });

    return NextResponse.json({
      success: true,
      property: data,
    });
  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

