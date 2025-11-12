# Commercial RE - Premium Real Estate Marketplace

A modern, high-performance commercial real estate marketplace built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

![Commercial RE](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80)

## 🚀 Features

### ✨ Modern UI/UX
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Smooth Animations**: Powered by Framer Motion for butter-smooth transitions
- **Interactive Elements**: Hover effects, scroll animations, and engaging interactions
- **Custom Scrollbar**: Branded custom scrollbar design

### 🏢 Core Functionality
- **Advanced Search**: Multi-tab search with property type filtering
- **Property Listings**: Grid-based property cards with detailed information
- **Favorites System**: Local storage-based favorites with heart icons
- **Live Auctions**: Dedicated auction section with featured properties
- **Statistics Dashboard**: Real-time stats showing platform metrics

### 🎨 Design System
- **Brand Colors**:
  - Primary Black: `#0a0a0a`
  - Accent Yellow: `#ffd700`
  - Custom Gray: `#888888`
- **Typography**: Segoe UI with Inter font fallback
- **Consistent Spacing**: Standardized spacing and sizing throughout

### 🖼️ Image Integration
- **Next.js Image Optimization**: All images optimized for performance
- **Unsplash Integration**: High-quality stock photography
- **Logo Integration**: Custom logoRE.png throughout the site
- **Lazy Loading**: Images load on-demand for better performance

### 🎯 Interactive Components
- **Navigation**: Fixed navigation with scroll detection
- **Hero Section**: Full-screen hero with animated background
- **Property Types**: 6 filterable property categories
- **Tabs System**: Multi-tab interface for different listing types
- **Animated Stats**: Counter animations for impressive metrics
- **Company Carousel**: Auto-scrolling company logos

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Optimization**: Next.js Image Component

## 📂 Project Structure

```
CommercialRE/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Navigation.tsx      # Fixed navigation bar
│   │   ├── Hero.tsx            # Hero section with search
│   │   ├── Listings.tsx        # Property listings grid
│   │   ├── Auctions.tsx        # Auction showcase
│   │   └── Footer.tsx          # Site footer
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/
│   └── assets/
│       └── logoRE.png          # Brand logo
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Components Overview

### Navigation
- Fixed position with backdrop blur
- Responsive mobile menu
- Logo with hover animation
- CTA buttons (Log In, Advertise)

### Hero Section
- Full-screen gradient background
- Animated background pattern
- Multi-tab search interface
- 6 property type filters
- Real-time search input
- Platform statistics (300K+ listings, 13M+ visitors, $380B+ value)
- Auto-scrolling company logos

### Listings
- 3-tab system (For Lease, For Sale, Auctions)
- 8 property cards with:
  - High-quality images from Unsplash
  - Property type badges
  - Favorite toggle (persisted in localStorage)
  - Price, address, and size information
  - Hover animations
- "See More" link for pagination

### Auctions
- Split layout (image + content)
- Featured auction property
- Live auction badge
- Property details card overlay
- CTA section with icon
- Learn more links

### Footer
- Brand logo and name
- Site description
- Quick links (About, Contact, Privacy, Terms, Careers, Help)
- Copyright information
- Responsive layout

## 🎯 Key Features Implemented

### Animations
- ✅ Framer Motion integration
- ✅ Scroll-triggered animations
- ✅ Hover transformations
- ✅ Page load animations
- ✅ Smooth transitions

### Interactions
- ✅ Functional tab switching
- ✅ Property type selection
- ✅ Search functionality
- ✅ Favorites system with localStorage
- ✅ Responsive mobile menu
- ✅ Smooth scrolling

### Performance
- ✅ Next.js Image optimization
- ✅ Lazy loading
- ✅ SEO meta tags
- ✅ TypeScript for type safety
- ✅ Optimized CSS with Tailwind

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints for all screen sizes
- ✅ Touch-friendly interactions
- ✅ Hamburger menu for mobile

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to change brand colors:
```typescript
colors: {
  'primary-black': '#0a0a0a',
  'accent-yellow': '#ffd700',
  'custom-gray': '#888888',
}
```

### Images
Replace Unsplash URLs in components with your own images or update to use different Unsplash photos.

### Logo
Replace `public/assets/logoRE.png` with your own logo.

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Configuration

### Next.js Image Domains
Images from Unsplash are configured in `next.config.js`:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
}
```

## 📈 Performance Optimizations

- ✅ Automatic image optimization
- ✅ Code splitting
- ✅ Lazy loading components
- ✅ CSS purging with Tailwind
- ✅ Font optimization
- ✅ Viewport-based animation triggers

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Vercel Deployment

This project is fully configured for Vercel deployment.

### Quick Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: `https://github.com/Mohit-rajput-mr/commercial.git`
   - Vercel will automatically detect Next.js and configure the project

2. **Automatic Configuration**:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Environment Variables** (if needed):
   - Add any environment variables in Vercel dashboard
   - Currently, no environment variables are required

4. **Deploy**:
   - Click "Deploy" and Vercel will build and deploy your project
   - Your site will be live at `your-project.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Vercel Configuration

The project includes:
- ✅ `next.config.js` with image optimization
- ✅ Proper `.gitignore` excluding build files
- ✅ TypeScript configuration
- ✅ All dependencies in `package.json`
- ✅ Build scripts configured

## 📝 License

This project is built for Commercial RE. All rights reserved.

## 🤝 Contributing

This is a private commercial project. For inquiries, please contact the development team.

## 📧 Support

For support, email support@commercialre.com or visit our help center.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS

