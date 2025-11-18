'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { isAdminAuthenticated, setAdminAuthenticated, getAdminChats, getAdminProfile } from '@/lib/admin-storage';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Live Chat', href: '/admin/chat', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState({ name: 'Admin', email: 'admin' });

  useEffect(() => {
    // Check authentication
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Load profile
    const adminProfile = getAdminProfile();
    setProfile(adminProfile);

    // Load unread chat count
    const updateUnreadCount = () => {
      const chats = getAdminChats();
      const unread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
      setUnreadCount(unread);
    };
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 2000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    setAdminAuthenticated(false);
    router.push('/admin/login');
  };

  const getBreadcrumbs = () => {
    const path = pathname.replace('/admin/', '');
    if (path === 'dashboard') return 'Dashboard';
    if (path === 'properties') return 'Properties Management';
    if (path === 'users') return 'User Management';
    if (path === 'chat') return 'Live Chat';
    if (path === 'settings') return 'Settings';
    return 'Admin Panel';
  };

  if (!isAdminAuthenticated()) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-primary-black z-50 md:hidden shadow-2xl"
            >
              <SidebarContent
                pathname={pathname}
                unreadCount={unreadCount}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col bg-primary-black text-white">
            <SidebarContent
              pathname={pathname}
              unreadCount={unreadCount}
              onLogout={handleLogout}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          {/* Top Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-primary-black p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-primary-black">{getBreadcrumbs()}</h1>
                  <nav className="text-sm text-custom-gray">
                    <Link href="/admin/dashboard" className="hover:text-primary-black">Admin</Link>
                    <ChevronRight size={14} className="inline mx-1" />
                    <span>{getBreadcrumbs()}</span>
                  </nav>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                    <Bell size={20} className="text-primary-black" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-accent-yellow text-primary-black rounded-full text-xs font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center text-primary-black font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-primary-black">
                      {profile.name}
                    </span>
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-primary-black">{profile.name}</p>
                          <p className="text-xs text-custom-gray">{profile.email}</p>
                        </div>
                        <Link
                          href="/admin/settings"
                          className="block px-4 py-2 text-sm text-primary-black hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  unreadCount,
  onClose,
  onLogout,
}: {
  pathname: string;
  unreadCount: number;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-1"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-accent-yellow text-primary-black font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
              {item.name === 'Live Chat' && unreadCount > 0 && (
                <span className="ml-auto bg-accent-yellow text-primary-black rounded-full px-2 py-0.5 text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}


