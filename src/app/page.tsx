'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import PopularCities from '@/components/PopularCities';
import SmartSpaceEstimationTool from '@/components/SmartSpaceEstimationTool';
import ArticlesSection from '@/components/ArticlesSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const { toasts, removeToast } = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleLoginTrigger = () => {
      setIsLoginOpen(true);
    };

    window.addEventListener('openLoginModal', handleLoginTrigger);

    return () => {
      window.removeEventListener('openLoginModal', handleLoginTrigger);
    };
  }, []);

  return (
    <div className="overflow-x-hidden max-w-full">
      <Navigation />
      <main className="overflow-x-hidden max-w-full">
        <Hero />
        <Listings />
        <PopularCities />
        <SmartSpaceEstimationTool />
        <ArticlesSection />
        <FAQSection />
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

