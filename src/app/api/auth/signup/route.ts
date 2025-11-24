import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    // Validate required fields
    if (!email || !password || !full_name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth user with Supabase Auth (auto-confirm, no verification needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        phone,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user record in users table
    let userData = null;
    if (authData.user) {
      const { data: newUser, error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          phone,
          role: 'user',
          status: 'active',
          email_verified: true, // Auto-verify
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error creating user record:', dbError);
      } else {
        userData = newUser;
      }

      // Log activity
      await supabaseAdmin.from('activities').insert({
        user_id: authData.user.id,
        activity_type: 'user_registered',
        description: `New user registered: ${full_name} (${email})`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now login.',
      user: userData || authData.user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

