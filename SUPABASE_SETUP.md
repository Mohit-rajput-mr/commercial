# Supabase & Pusher Integration Setup Guide

## 📋 Overview

This document provides step-by-step instructions to set up and integrate Supabase (database & authentication) and Pusher (real-time chat) with your Commercial Real Estate platform.

## 🔑 Credentials (Already Hardcoded)

### Supabase
- **Project URL**: `https://imqtqsvktoewempyyimf.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcXRxc3ZrdG9ld2VtcHl5aW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTc5NjMsImV4cCI6MjA3OTUzMzk2M30.Bcvw8HahevASE34Facbj25ePZ9d7qZ0_XFv-9jYcYzs`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcXRxc3ZrdG9ld2VtcHl5aW1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk1Nzk2MywiZXhwIjoyMDc5NTMzOTYzfQ.ykB4jS1A91_i4A4VfY_bb5YCkpngoPei5bId-x0BQN8`

### Pusher
- **App ID**: `2082273`
- **Key**: `2d5b5b5b3ac70f656fe8`
- **Secret**: `6f591d8634453ba4c23d`
- **Cluster**: `us2`

## 🚀 Step 1: Run SQL Migration

1. Go to your Supabase Dashboard: https://imqtqsvktoewempyyimf.supabase.co
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy the entire contents of `supabase-migration.sql` file from the project root
5. Paste it into the SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter)

This will create:
- ✅ All database tables (users, properties, chats, chat_messages, favorites, inquiries, activities, etc.)
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers and functions
- ✅ Full-text search capabilities
- ✅ Default site settings

## 📦 Step 2: Upload Existing Properties

You have two JSON datasets that need to be uploaded to Supabase:

### Option A: Via Admin Panel (Recommended)
1. Start the development server: `npm run dev`
2. Login as admin: 
   - Email: `admin`
   - Password: `admin`
3. Go to Admin Dashboard → Properties
4. Click "Upload JSON" button
5. Select either:
   - `public/commercial_dataset2.json`
   - `public/commercial_dataset_17nov2025.json`
6. Click "Upload"

### Option B: Via API (Direct)
```bash
# You can use this curl command or Postman
curl -X POST http://localhost:3000/api/properties/upload-json \
  -H "Content-Type: application/json" \
  -d @public/commercial_dataset2.json
```

## 🎯 Step 3: Test the Integration

### Test Authentication
1. Go to http://localhost:3000
2. Click "Log In" or "Sign Up"
3. Create a new account or login with:
   - **Admin**: email: `admin`, password: `admin`
   - **Regular User**: Create a new account with email/password

### Test Properties
1. Browse properties on the homepage
2. Use search and filters
3. Click on a property to view details
4. Properties should load from Supabase database

### Test Live Chat
1. Login as a regular user
2. Click "Live Chat" button in the navbar
3. Send a message
4. Open another browser/incognito window
5. Login as admin: http://localhost:3000/admin/dashboard
6. Go to "Chats" section
7. You should see the message in real-time (via Pusher)

### Test Admin Panel
1. Login as admin (email: `admin`, password: `admin`)
2. Go to http://localhost:3000/admin/dashboard
3. You should see:
   - Real statistics from database
   - Recent activities
   - Property management
   - User management
   - Chat management
   - Settings

## 📊 Database Schema

### Main Tables

#### `users`
- Stores all user accounts (regular users, agents, admins)
- Linked to Supabase Auth

#### `properties`
- All property listings
- Full-text search enabled
- Tracks views and inquiries

#### `chats`
- Chat sessions between users and admin
- Tracks unread counts

#### `chat_messages`
- Individual chat messages
- Real-time via Pusher

#### `favorites`
- User's saved properties

#### `inquiries`
- Property inquiries from users

#### `activities`
- Activity log for admin dashboard

#### `site_settings`
- Configurable site settings

## 🔐 Authentication Flow

### Regular Users
1. Sign up with email, name, phone, password
2. Email verification (optional, can be enabled later)
3. Login with email/password
4. Session managed by Supabase Auth

### Admin
- Hardcoded login: `admin` / `admin`
- Bypasses Supabase Auth for quick access
- Full access to admin panel

## 💬 Real-Time Chat Flow

### Client Side
1. User opens chat modal
2. Creates/retrieves chat session via `/api/chats`
3. Loads message history via `/api/chats/[id]/messages`
4. Subscribes to Pusher channel: `chat-{chatId}`
5. Listens for `new-message` events

### Server Side
1. User sends message via POST `/api/chats/[id]/messages`
2. Message saved to database
3. Pusher event triggered to `chat-{chatId}` channel
4. All connected clients receive message instantly

### Admin Dashboard
- Subscribes to `admin-dashboard` channel
- Receives notifications for new chats and messages
- Can respond in real-time

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List properties (with filters)
- `POST /api/properties` - Create property (admin only)
- `GET /api/properties/[id]` - Get property details
- `PUT /api/properties/[id]` - Update property (admin only)
- `DELETE /api/properties/[id]` - Delete property (admin only)
- `POST /api/properties/upload-json` - Bulk upload from JSON (admin only)

### Chats
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]/messages` - Get chat messages
- `POST /api/chats/[id]/messages` - Send message
- `PUT /api/chats/[id]/read` - Mark messages as read

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/settings` - Get site settings
- `PUT /api/admin/settings` - Update site settings

## 🔍 Search Functionality

Properties support full-text search on:
- Address
- City
- State
- ZIP code
- Description

Search also supports filters:
- Property type
- Status (For Lease, For Sale, Auctions)
- Price range
- Location (city, state)

## 📈 Analytics

The platform tracks:
- Property views (with IP and user tracking)
- User activities
- Chat metrics
- Property inquiries

## 🎨 Customization

### Site Settings (via Admin Panel)
- Site title and description
- Contact information
- Brand colors
- Properties per page
- Enable/disable features
- Maintenance mode

### Property Types
- Office
- Retail
- Industrial
- Flex
- Coworking
- Medical
- Land
- Condo
- House
- Multi-Family
- Other

### Property Statuses
- For Lease
- For Sale
- Auctions
- Businesses For Sale
- Land For Auction

## 🐛 Troubleshooting

### Issue: Properties not showing
- Check if SQL migration ran successfully
- Verify properties were uploaded via JSON
- Check browser console for API errors

### Issue: Chat not working
- Verify Pusher credentials are correct
- Check browser console for Pusher connection errors
- Ensure user is logged in

### Issue: Admin login not working
- Use exact credentials: `admin` / `admin`
- Clear browser cache and localStorage
- Check if admin user was created in database

### Issue: Authentication errors
- Check Supabase credentials in `src/lib/supabase.ts`
- Verify Supabase project is active
- Check browser network tab for API errors

## 📝 Next Steps

### Recommended Enhancements
1. **Email Service**: Configure Supabase email templates for:
   - Email verification
   - Password reset
   - Property alerts

2. **Storage**: Set up Supabase Storage buckets for:
   - Property images
   - User avatars
   - Documents

3. **Environment Variables**: Move credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://imqtqsvktoewempyyimf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PUSHER_APP_ID=2082273
   NEXT_PUBLIC_PUSHER_KEY=2d5b5b5b3ac70f656fe8
   PUSHER_SECRET=6f591d8634453ba4c23d
   NEXT_PUBLIC_PUSHER_CLUSTER=us2
   ```

4. **Admin Chat Interface**: Build dedicated chat interface in admin panel

5. **Push Notifications**: Add browser push notifications for new messages

6. **Advanced Search**: Implement map-based search and radius filters

7. **Analytics Dashboard**: Add charts and graphs for property performance

## 🆘 Support

If you encounter any issues:
1. Check this guide first
2. Review browser console for errors
3. Check Supabase logs in dashboard
4. Verify all credentials are correct

## ✅ Checklist

- [ ] SQL migration completed successfully
- [ ] Properties uploaded from JSON files
- [ ] Admin login working (`admin`/`admin`)
- [ ] User registration working
- [ ] User login working
- [ ] Properties displaying from database
- [ ] Property search and filters working
- [ ] Live chat working with Pusher
- [ ] Admin dashboard showing real data
- [ ] All API endpoints responding correctly

---

**🎉 Congratulations!** Your Commercial Real Estate platform is now fully integrated with Supabase and Pusher!



