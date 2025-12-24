'use client';

import { useState, useEffect } from 'react';
import RouteProgressBar from './RouteProgressBar';
import Navigation from './Navigation';
import LoginModal from './LoginModal';
import SidebarMenu from './SidebarMenu';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'signup'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for global modal events from Navigation or any component
    const handleOpenLoginModal = () => {
      setLoginModalMode('login');
      setIsLoginModalOpen(true);
    };

    const handleOpenSignUpModal = () => {
      setLoginModalMode('signup');
      setIsLoginModalOpen(true);
    };

    const handleOpenSidebar = () => {
      setIsSidebarOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openSignUpModal', handleOpenSignUpModal);
    window.addEventListener('openSidebarMenu', handleOpenSidebar);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openSignUpModal', handleOpenSignUpModal);
      window.removeEventListener('openSidebarMenu', handleOpenSidebar);
    };
  }, []);

  return (
    <>
      <RouteProgressBar />
      
      {/* Global Navigation - appears on all pages */}
      <Navigation />
      
      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignUp={() => {
          setLoginModalMode('signup');
        }}
        initialMode={loginModalMode}
      />

      {/* Global Sidebar Menu */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLoginClick={() => {
          setIsSidebarOpen(false);
          setLoginModalMode('login');
          setIsLoginModalOpen(true);
        }}
        onSignUpClick={() => {
          setIsSidebarOpen(false);
          setLoginModalMode('signup');
          setIsLoginModalOpen(true);
        }}
      />

      {/* Page content with padding for navbar */}
      {children}
    </>
  );
}
