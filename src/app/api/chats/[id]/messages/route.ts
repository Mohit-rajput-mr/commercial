import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { triggerPusherEvent } from '@/lib/pusher-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check for admin token first
    const adminToken = request.headers.get('x-admin-token');
    let userId: string | null = null;

    if (adminToken === 'admin-authenticated') {
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'admin@admin.com')
        .eq('role', 'admin')
        .single();
      
      if (adminUser) {
        userId = adminUser.id;
      }
    }

    // Try Supabase auth if not admin
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        userId = user.id;
      }
    }

    // If still no userId, check headers
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }

    // Admin can always access, but for non-admin we need userId
    if (!userId && adminToken !== 'admin-authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get messages with sender info
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, full_name, email, role)
      `)
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: data,
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { message_text } = body;

    // Try to get user from Supabase auth first
    let userId: string | null = null;
    
    const authHeader = request.headers.get('authorization');
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

    // If no Supabase user, check headers or body
    if (!userId) {
      userId = body.user_id || request.headers.get('x-user-id') || null;
    }

    // If still no userId, try to get from user email
    if (!userId) {
      const userEmail = request.headers.get('x-user-email');
      if (userEmail) {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single();
        
        if (existingUser) {
          userId = existingUser.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user info
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Create message
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        chat_id: id,
        sender_id: userId,
        message_text,
        is_read: false,
      })
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, full_name, email, role)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Update chat last_message_at and unread count
    const isAdmin = userData?.role === 'admin' || false;
    
    // Get current chat to update unread counts
    const { data: currentChat } = await supabaseAdmin
      .from('chats')
      .select('unread_count_admin, unread_count_user')
      .eq('id', id)
      .single();
    
    const updateData: any = {
      last_message_at: new Date().toISOString(),
    };
    
    if (isAdmin) {
      updateData.unread_count_user = (currentChat?.unread_count_user || 0) + 1;
    } else {
      updateData.unread_count_admin = (currentChat?.unread_count_admin || 0) + 1;
    }
    
    await supabaseAdmin
      .from('chats')
      .update(updateData)
      .eq('id', id);

    // Create sender object for Pusher events
    const senderData = userData || {
      id: userId,
      full_name: userData?.full_name || request.headers.get('x-user-name') || 'User',
      email: userData?.email || request.headers.get('x-user-email') || '',
      role: isAdmin ? 'admin' : 'user',
    };

    // Trigger Pusher event for real-time update on the chat channel
    await triggerPusherEvent(`chat-${id}`, 'new-message', {
      message: data,
      sender: senderData,
    });

    // Trigger admin dashboard update if message is from user (not admin)
    if (!isAdmin) {
      await triggerPusherEvent('admin-dashboard', 'new-chat-message', {
        chatId: id,
        message: data,
        sender: senderData,
      });
    } else {
      // If admin sends message, notify user's chat
      await triggerPusherEvent('user-chat-update', 'admin-replied', {
        chatId: id,
        message: data,
      });
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



