import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get user from Supabase auth first
    let userId: string | null = null;
    let isAdmin = false;
    
    const authHeader = request.headers.get('authorization');
    const adminToken = request.headers.get('x-admin-token');
    
    // Check for admin token (for localStorage-based admin auth)
    if (adminToken === 'admin-authenticated') {
      // This is an admin request - find admin user
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('email', 'admin@admin.com')
        .eq('role', 'admin')
        .single();
      
      if (adminUser) {
        userId = adminUser.id;
        isAdmin = true;
      }
    }
    
    // Try Supabase auth if no admin token
    if (!userId) {
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        if (authUser) {
          userId = authUser.id;
        }
      } else {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!authError && authUser) {
          userId = authUser.id;
        }
      }
    }
    
    // If still no userId, check for user email in headers
    if (!userId) {
      const userEmail = request.headers.get('x-user-email');
      if (userEmail) {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id, role, email')
          .eq('email', userEmail)
          .single();
        
        if (existingUser) {
          userId = existingUser.id;
          if (existingUser.role === 'admin' || existingUser.email === 'admin@admin.com') {
            isAdmin = true;
          }
        }
      }
    }

    if (!userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If we have userId, check role
    if (userId && !isAdmin) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('role, email')
        .eq('id', userId)
        .single();
      
      if (userData && (userData.role === 'admin' || userData.email === 'admin@admin.com')) {
        isAdmin = true;
      }
    }

    // Build query to get chats
    let query = supabaseAdmin
      .from('chats')
      .select(`
        *,
        user:users!chats_user_id_fkey(id, full_name, email, phone),
        property:properties(id, zpid, address, city, state)
      `)
      .order('last_message_at', { ascending: false });

    // If not admin, only show user's own chats
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    // If admin but no userId (localStorage admin), show all chats
    // Admin always sees all chats
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Ensure chats have proper structure
    const formattedChats = (data || []).map((chat: any) => ({
      ...chat,
      unread_count_admin: chat.unread_count_admin || 0,
      unread_count_user: chat.unread_count_user || 0,
      last_message_at: chat.last_message_at || chat.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      chats: formattedChats || [],
    });
  } catch (error) {
    console.error('Chats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id } = body;

    // Try to get user from Supabase auth first
    let user = null;
    let userId: string | null = null;
    
    const authHeader = request.headers.get('authorization');
    
    // Try Supabase auth if session token is provided
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      if (authUser) {
        user = authUser;
        userId = authUser.id;
      }
    } else {
      // Try to get user from Supabase session
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
        userId = authUser.id;
      }
    }

    // If no Supabase user, check for user info in request body or header
    if (!userId) {
      const userInfo = body.user || request.headers.get('x-user-id');
      if (userInfo) {
        // If userInfo is a string (ID), use it directly
        if (typeof userInfo === 'string') {
          userId = userInfo;
        } else if (userInfo.id) {
          userId = userInfo.id;
        }
      }
    }

    // If still no userId, try to get or create user from email in localStorage
    if (!userId) {
      const userEmail = request.headers.get('x-user-email');
      const userName = request.headers.get('x-user-name');
      const userPhone = request.headers.get('x-user-phone');
      
      if (userEmail) {
        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single();
        
        if (existingUser) {
          userId = existingUser.id;
        } else if (userName && userPhone) {
          // Create new user
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              email: userEmail,
              full_name: userName,
              phone: userPhone,
              role: 'user',
              status: 'active',
              email_verified: false,
            })
            .select('id')
            .single();
          
          if (!createError && newUser) {
            userId = newUser.id;
          }
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if chat already exists for this user and property
    const { data: existingChat } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', property_id || null)
      .single();

    if (existingChat) {
      return NextResponse.json({
        success: true,
        chat: existingChat,
      });
    }

    // Create new chat
    const { data, error } = await supabaseAdmin
      .from('chats')
      .insert({
        user_id: userId,
        property_id: property_id || null,
        status: 'active',
        unread_count_user: 0,
        unread_count_admin: 0,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin.from('activities').insert({
      user_id: userId,
      property_id: property_id || null,
      activity_type: 'chat_started',
      description: `Chat started${property_id ? ' for property' : ''}`,
    });

    return NextResponse.json({
      success: true,
      chat: data,
    });
  } catch (error) {
    console.error('Chat creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



