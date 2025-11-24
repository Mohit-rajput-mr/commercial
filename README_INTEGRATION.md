# 🏢 Commercial Real Estate Platform - Full Stack Integration

## 🎯 Overview

This is a **complete, production-ready** commercial real estate platform with:
- ✅ **Supabase** for database and authentication
- ✅ **Pusher** for real-time chat
- ✅ **Next.js 14** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Framer Motion** for animations

---

## 🚀 Quick Start

**Get started in 5 minutes!** See [`QUICK_START.md`](./QUICK_START.md)

```bash
# 1. Run SQL migration in Supabase Dashboard
# 2. Start dev server
npm run dev
# 3. Login as admin: admin/admin
# 4. Upload properties from JSON
# 5. Done! 🎉
```

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Setup](#-setup)
5. [API Documentation](#-api-documentation)
6. [Database Schema](#-database-schema)
7. [Authentication](#-authentication)
8. [Real-Time Chat](#-real-time-chat)
9. [Admin Panel](#-admin-panel)
10. [Deployment](#-deployment)

---

## ✨ Features

### For Users
- 🔍 **Advanced Search** - Full-text search with filters
- 💬 **Live Chat** - Real-time chat with Leo Jo
- 📱 **WhatsApp Integration** - Direct WhatsApp contact
- ⭐ **Favorites** - Save favorite properties
- 🔔 **Alerts** - Get notified of new listings
- 📊 **Property Details** - Comprehensive property information
- 🗺️ **Location Data** - City, state, ZIP search

### For Admins
- 📊 **Dashboard** - Real-time statistics and analytics
- 🏢 **Property Management** - Full CRUD operations
- 👥 **User Management** - Manage all users
- 💬 **Chat Management** - Respond to all chats
- ⚙️ **Settings** - Configure site settings
- 📝 **Activity Log** - Track all activities
- 📤 **Bulk Upload** - Upload properties from JSON

### Technical Features
- 🔐 **Secure Authentication** - Supabase Auth
- 🗄️ **PostgreSQL Database** - Supabase backend
- ⚡ **Real-time Updates** - Pusher integration
- 🔍 **Full-text Search** - PostgreSQL TSVECTOR
- 🛡️ **Row Level Security** - Database-level security
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Server-side Rendering** - Next.js 14
- 🎨 **Modern UI** - Tailwind CSS + Framer Motion

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide Icons** - Modern icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database + Auth
- **Pusher** - Real-time messaging
- **PostgreSQL** - Relational database

### DevOps
- **Vercel** - Hosting (recommended)
- **Supabase Cloud** - Database hosting
- **Pusher Cloud** - Real-time service

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │   Pusher.js  │  │   Supabase   │  │
│  │   Frontend   │  │    Client    │  │    Client    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js API Routes                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │  Properties  │  │    Chats     │  │
│  │   /api/auth  │  │/api/properties│ │  /api/chats  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐                                       │
│  │    Admin     │                                       │
│  │  /api/admin  │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   Supabase (Database)   │  │   Pusher (Real-time)    │
│  ┌──────────────────┐   │  │  ┌──────────────────┐   │
│  │   PostgreSQL     │   │  │  │   Channels       │   │
│  │   + Auth         │   │  │  │   + Events       │   │
│  │   + Storage      │   │  │  │   + Presence     │   │
│  └──────────────────┘   │  │  └──────────────────┘   │
└─────────────────────────┘  └─────────────────────────┘
```

---

## 📦 Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Pusher account

### Installation

1. **Clone & Install**
```bash
git clone <repository>
cd commercial
npm install
```

2. **Run SQL Migration**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Run `supabase-migration.sql`

3. **Start Development Server**
```bash
npm run dev
```

4. **Upload Properties**
   - Login as admin (`admin`/`admin`)
   - Upload `public/commercial_dataset2.json`

See [`QUICK_START.md`](./QUICK_START.md) for detailed instructions.

---

## 📡 API Documentation

### Authentication

#### `POST /api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": { ... }
}
```

#### `POST /api/auth/login`
Login with email/password or admin credentials.

**Request:**
```json
{
  "email": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

### Properties

#### `GET /api/properties`
List properties with filters.

**Query Parameters:**
- `search` - Search term
- `city` - Filter by city
- `state` - Filter by state
- `status` - Filter by status
- `type` - Filter by property type
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "properties": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `POST /api/properties`
Create a new property (admin only).

#### `GET /api/properties/[id]`
Get property details.

#### `PUT /api/properties/[id]`
Update property (admin only).

#### `DELETE /api/properties/[id]`
Delete property (admin only).

#### `POST /api/properties/upload-json`
Bulk upload properties from JSON (admin only).

### Chats

#### `GET /api/chats`
List user's chats (admin sees all).

#### `POST /api/chats`
Create new chat session.

#### `GET /api/chats/[id]/messages`
Get chat messages.

#### `POST /api/chats/[id]/messages`
Send a message.

#### `PUT /api/chats/[id]/read`
Mark messages as read.

### Admin

#### `GET /api/admin/dashboard`
Get dashboard statistics.

#### `GET /api/admin/users`
List all users.

#### `PUT /api/admin/users/[id]`
Update user.

#### `DELETE /api/admin/users/[id]`
Delete user.

#### `GET /api/admin/settings`
Get site settings.

#### `PUT /api/admin/settings`
Update site settings.

---

## 🗄️ Database Schema

### Tables

#### `users`
User accounts and profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | Email address |
| full_name | TEXT | Full name |
| phone | TEXT | Phone number |
| role | TEXT | user/admin/agent |
| status | TEXT | active/inactive/blocked |
| email_verified | BOOLEAN | Email verified |
| created_at | TIMESTAMPTZ | Created timestamp |

#### `properties`
Property listings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| zpid | TEXT | Unique property ID |
| address | TEXT | Street address |
| city | TEXT | City |
| state | TEXT | State |
| price | NUMERIC | Price |
| status | TEXT | For Lease/Sale/Auction |
| property_type | TEXT | Office/Retail/etc |
| beds | INTEGER | Bedrooms |
| baths | NUMERIC | Bathrooms |
| sqft | INTEGER | Square footage |
| images | JSONB | Image URLs |
| is_active | BOOLEAN | Active listing |

#### `chats`
Chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| property_id | UUID | Property reference |
| status | TEXT | active/resolved/archived |
| unread_count_user | INTEGER | Unread by user |
| unread_count_admin | INTEGER | Unread by admin |

#### `chat_messages`
Individual messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chat_id | UUID | Chat reference |
| sender_id | UUID | Sender reference |
| message_text | TEXT | Message content |
| is_read | BOOLEAN | Read status |

See `supabase-migration.sql` for complete schema.

---

## 🔐 Authentication

### User Authentication
- Email + password registration
- Email verification (optional)
- Password reset via email
- Session management via Supabase

### Admin Authentication
- Hardcoded credentials: `admin`/`admin`
- Bypasses Supabase Auth
- Instant access to admin panel
- Can be changed in code

### Security
- Row Level Security (RLS) enabled
- JWT-based sessions
- Secure password hashing
- HTTPS enforced

---

## 💬 Real-Time Chat

### How It Works

1. **User opens chat**
   - Creates/retrieves chat session
   - Loads message history
   - Subscribes to Pusher channel

2. **User sends message**
   - Message saved to database
   - Pusher event triggered
   - All clients receive update

3. **Admin receives notification**
   - Admin dashboard subscribed to events
   - Real-time notification
   - Can respond immediately

### Pusher Channels

- `chat-{chatId}` - Individual chat channels
- `admin-dashboard` - Admin notifications
- Events: `new-message`, `chat-created`

---

## 👑 Admin Panel

### Features
- **Dashboard** - Statistics and analytics
- **Properties** - CRUD operations
- **Users** - User management
- **Chats** - Chat management
- **Settings** - Site configuration
- **Activities** - Activity log

### Access
- URL: `/admin/dashboard`
- Login: `admin` / `admin`
- Full access to all features

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
   - Connect repository
   - Auto-deploy on push
   - Environment variables set

3. **Configure Environment**
   - Add Supabase credentials
   - Add Pusher credentials
   - Set production URL

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://imqtqsvktoewempyyimf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUSHER_APP_ID=2082273
NEXT_PUBLIC_PUSHER_KEY=2d5b5b5b3ac70f656fe8
PUSHER_SECRET=6f591d8634453ba4c23d
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

---

## 📚 Documentation

- [`QUICK_START.md`](./QUICK_START.md) - Get started in 5 minutes
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Detailed setup guide
- [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md) - Technical details
- `supabase-migration.sql` - Database schema

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is proprietary software.

---

## 📞 Contact

- **Leo Jo**: +1 (917) 209-6200
- **Email**: leojoemail@gmail.com
- **WhatsApp**: Available via chat

---

## 🎉 Acknowledgments

Built with:
- Next.js
- Supabase
- Pusher
- Tailwind CSS
- TypeScript

---

**Made with ❤️ for the commercial real estate industry**



