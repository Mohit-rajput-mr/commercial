import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check for admin login
    if (email.toLowerCase() === 'admin' && password === 'admin') {
      // Get or create admin user
      let { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'admin@admin.com')
        .single();

      if (!adminUser) {
        // Create admin user
        const { data: newAdmin } = await supabaseAdmin
          .from('users')
          .insert({
            email: 'admin@admin.com',
            full_name: 'Admin',
            phone: '+1 (917) 209-6200',
            role: 'admin',
            status: 'active',
            email_verified: true,
          })
          .select()
          .single();
        
        adminUser = newAdmin;
      }

      // Update last login
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser!.id);

      return NextResponse.json({
        success: true,
        user: adminUser,
        isAdmin: true,
      });
    }

    // Regular user login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    // Update last login
    if (authData.user) {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Log activity
      await supabaseAdmin.from('activities').insert({
        user_id: authData.user.id,
        activity_type: 'user_login',
        description: `User logged in: ${authData.user.email}`,
      });
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



