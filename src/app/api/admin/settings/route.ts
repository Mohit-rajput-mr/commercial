import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.value;
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Update settings
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value,
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from('site_settings')
        .upsert(update, { onConflict: 'key' });
    }

    // Log activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      activity_type: 'settings_updated',
      description: 'Site settings updated',
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}








