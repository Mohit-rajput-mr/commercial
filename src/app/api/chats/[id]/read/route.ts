import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check for admin token first
    const adminToken = request.headers.get('x-admin-token');
    let isAdmin = false;
    let userId: string | null = null;

    if (adminToken === 'admin-authenticated') {
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

    // Try Supabase auth if not admin
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Check admin status if we have userId
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

    if (!userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark all messages as read (mark messages NOT from current user/admin as read)
    if (userId) {
      await supabaseAdmin
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_id', id)
        .neq('sender_id', userId);
    }

    // Reset unread count
    await supabaseAdmin
      .from('chats')
      .update(
        isAdmin 
          ? { unread_count_admin: 0 }
          : { unread_count_user: 0 }
      )
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



