import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try to find by ID first (UUID)
    let data, error;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Use supabaseAdmin to bypass RLS for public access
    if (uuidRegex.test(id)) {
      // It's a UUID, search by id
      const result = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      data = result.data;
      error = result.error;
    } else {
      // It's a zpid, search by zpid
      const result = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('zpid', id)
        .eq('is_active', true)
        .single();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Increment view count (use the property's actual ID, not the search id)
    await supabaseAdmin
      .from('properties')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id);

    // Track view (try to get user, but don't fail if not authenticated)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabaseAdmin.from('property_views').insert({
        property_id: data.id,
        user_id: user?.id || null,
      });
    } catch (viewErr) {
      // Ignore errors for view tracking
      console.log('Could not track view:', viewErr);
    }

    return NextResponse.json({
      success: true,
      property: data,
    });
  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Get current user
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

    // Update property
    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      property_id: data.id,
      activity_type: 'property_updated',
      description: `Property updated: ${data.address}, ${data.city}, ${data.state}`,
    });

    return NextResponse.json({
      success: true,
      property: data,
    });
  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check for admin token
    const adminToken = request.headers.get('x-admin-token');
    
    if (adminToken === 'admin-authenticated') {
      // Get property details before deletion
      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      // Delete property (soft delete by setting is_active to false)
      const { error } = await supabaseAdmin
        .from('properties')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Log activity
      if (property) {
        await supabaseAdmin.from('activities').insert({
          user_id: null,
          property_id: id,
          activity_type: 'property_deleted',
          description: `Property deleted by admin: ${property.address}, ${property.city}, ${property.state}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Property deleted successfully',
      });
    }

    // Get current user
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

    // Get property details before deletion
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    // Delete property (soft delete by setting is_active to false)
    const { error } = await supabaseAdmin
      .from('properties')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity
    if (property) {
      await supabaseAdmin.from('activities').insert({
        user_id: user.id,
        property_id: id,
        activity_type: 'property_deleted',
        description: `Property deleted: ${property.address}, ${property.city}, ${property.state}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Property deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

