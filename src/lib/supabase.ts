import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for testing - will move to .env later
const SUPABASE_URL = 'https://imqtqsvktoewempyyimf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcXRxc3ZrdG9ld2VtcHl5aW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTc5NjMsImV4cCI6MjA3OTUzMzk2M30.Bcvw8HahevASE34Facbj25ePZ9d7qZ0_XFv-9jYcYzs';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcXRxc3ZrdG9ld2VtcHl5aW1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk1Nzk2MywiZXhwIjoyMDc5NTMzOTYzfQ.ykB4jS1A91_i4A4VfY_bb5YCkpngoPei5bId-x0BQN8';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: 'user' | 'admin' | 'agent';
          status: 'active' | 'inactive' | 'blocked';
          avatar_url: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          total_inquiries: number;
          metadata: any;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone: string;
          role?: 'user' | 'admin' | 'agent';
          status?: 'active' | 'inactive' | 'blocked';
          avatar_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          total_inquiries?: number;
          metadata?: any;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          role?: 'user' | 'admin' | 'agent';
          status?: 'active' | 'inactive' | 'blocked';
          avatar_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          total_inquiries?: number;
          metadata?: any;
        };
      };
      properties: {
        Row: {
          id: string;
          zpid: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          country: string;
          price: number | null;
          price_text: string | null;
          status: string;
          property_type: string;
          beds: number | null;
          baths: number | null;
          sqft: number | null;
          living_area: number | null;
          lot_size: number | null;
          year_built: number | null;
          description: string | null;
          features: any;
          images: any;
          virtual_tour_url: string | null;
          latitude: number | null;
          longitude: number | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          views: number;
          inquiries: number;
          is_featured: boolean;
          is_active: boolean;
          listing_url: string | null;
          source: string;
          listed_date: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          status: 'active' | 'resolved' | 'archived';
          unread_count_user: number;
          unread_count_admin: number;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          message_text: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};








