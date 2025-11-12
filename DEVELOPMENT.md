# Development Guide - Commercial RE

## 🎯 Project Overview

This document provides detailed information for developers working on the Commercial RE platform.

## 📦 Tech Stack Details

### Core Technologies
- **Next.js 14.2.5**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5.5.4**: Type-safe JavaScript
- **Tailwind CSS 3.4.4**: Utility-first CSS framework
- **Framer Motion 11.3.19**: Animation library
- **Lucide React 0.400.0**: Icon library

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🏗️ Architecture

### File Structure Explanation

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (wraps all pages)
│   ├── page.tsx           # Home page (/)
│   ├── globals.css        # Global styles
│   ├── loading.tsx        # Loading UI
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── Navigation.tsx     # Header/navbar
│   ├── Hero.tsx          # Hero section
│   ├── Listings.tsx      # Property listings
│   ├── Auctions.tsx      # Auction section
│   └── Footer.tsx        # Footer
└── types/                # TypeScript types
    └── index.ts          # Shared type definitions
```

## 🎨 Design System

### Color Palette
```css
--primary-black: #0a0a0a    /* Main dark color */
--secondary-black: #1a1a1a  /* Lighter dark */
--accent-yellow: #ffd700    /* Brand accent */
--custom-gray: #888888      /* Text gray */
--light-gray: #f5f5f5       /* Background gray */
```

### Typography Scale
- **Hero**: 56px - 72px
- **H1**: 42px - 56px
- **H2**: 36px - 42px
- **H3**: 28px - 36px
- **Body**: 16px - 18px
- **Small**: 14px

### Spacing Scale
- **xs**: 8px
- **sm**: 16px
- **md**: 24px
- **lg**: 32px
- **xl**: 48px
- **2xl**: 64px

## 🔧 Component Development

### Creating New Components

1. **Create component file** in `src/components/`
```tsx
'use client'; // If using hooks or browser APIs

import { motion } from 'framer-motion';

export default function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

2. **Add types** if needed in `src/types/index.ts`
```typescript
export interface MyComponentProps {
  title: string;
  data: DataType[];
}
```

3. **Import and use** in pages or other components
```tsx
import MyComponent from '@/components/MyComponent';
```

## 🎭 Animation Patterns

### Framer Motion Best Practices

**Fade In on Load:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

**Scroll-Triggered Animation:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

**Hover Effect:**
```tsx
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
```

## 📱 Responsive Design

### Breakpoints
```javascript
// Tailwind breakpoints
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

### Mobile-First Approach
Always start with mobile styles, then add larger breakpoints:
```tsx
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

## 🔍 State Management

### Local Storage for Favorites
```typescript
// Save favorites
localStorage.setItem('favorites', JSON.stringify([...favorites]));

// Load favorites
const saved = localStorage.getItem('favorites');
if (saved) {
  setFavorites(new Set(JSON.parse(saved)));
}
```

### React useState for UI State
```typescript
const [activeTab, setActiveTab] = useState<TabType>('For Lease');
const [isOpen, setIsOpen] = useState(false);
```

## 🖼️ Image Optimization

### Using Next.js Image
```tsx
import Image from 'next/image';

<Image
  src="/assets/logo.png"
  alt="Logo"
  width={500}
  height={300}
  priority // For above-fold images
/>
```

### External Images (Unsplash)
Configure in `next.config.js`:
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

## 🧪 Testing Guidelines

### Component Testing Checklist
- [ ] Renders correctly on all screen sizes
- [ ] Animations work smoothly
- [ ] Interactive elements respond to user input
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Images load and display properly
- [ ] Accessibility features work (keyboard navigation, ARIA labels)

## 🚀 Performance Optimization

### Best Practices
1. **Use Dynamic Imports** for heavy components
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
});
```

2. **Optimize Images**
- Use Next.js Image component
- Provide appropriate sizes
- Use lazy loading for below-fold images

3. **Reduce Bundle Size**
- Import only what you need from libraries
```tsx
// Good
import { Heart } from 'lucide-react';

// Bad
import * as Icons from 'lucide-react';
```

## 🐛 Common Issues & Solutions

### Issue: Hydration Error
**Solution**: Make sure server and client render the same content initially. Use `useEffect` for client-only code.

### Issue: Images Not Loading
**Solution**: Check `next.config.js` remote patterns and ensure paths are correct.

### Issue: Animations Not Working
**Solution**: Ensure `'use client'` directive is added to components using Framer Motion.

## 📝 Code Style Guide

### TypeScript
- Use interfaces for object types
- Use type for unions and primitives
- Always define prop types
- Avoid `any` type

### React
- Use functional components
- Prefer named exports for components
- Use meaningful variable names
- Keep components focused and small

### Tailwind
- Use consistent spacing (multiples of 4)
- Group related classes
- Use custom colors from config
- Prefer utility classes over custom CSS

## 🔐 Environment Variables

Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

Access in code:
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

## 📊 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `docs/update-description` - Documentation

### Commit Messages
```
feat: Add property search functionality
fix: Correct favorite button state
refactor: Improve Hero component performance
docs: Update development guide
style: Format code with Prettier
```

## 🚢 Deployment

### Build Command
```bash
npm run build
```

### Environment Variables for Production
Set these in your hosting platform:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- Any API keys needed

### Pre-Deployment Checklist
- [ ] Run `npm run build` successfully
- [ ] Test in production mode (`npm start`)
- [ ] Check all images load
- [ ] Verify all links work
- [ ] Test on multiple devices
- [ ] Check lighthouse scores
- [ ] Verify SEO meta tags

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

## 💡 Future Enhancements

### Planned Features
- [ ] User authentication system
- [ ] Property details pages
- [ ] Advanced search filters
- [ ] Map view for properties
- [ ] User dashboard
- [ ] Saved searches
- [ ] Email notifications
- [ ] Chat/messaging system
- [ ] Property comparison tool
- [ ] Virtual tours integration

### Technical Improvements
- [ ] Add unit tests (Jest, React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Implement API routes
- [ ] Add database integration
- [ ] Set up CI/CD pipeline
- [ ] Add analytics tracking
- [ ] Implement error tracking (Sentry)
- [ ] Add performance monitoring

---

For questions or issues, please contact the development team.

