'use client';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import Auctions from '@/components/Auctions';
import PopularCities from '@/components/PopularCities';
import ToolsSection from '@/components/ToolsSection';
import ArticlesSection from '@/components/ArticlesSection';
import MarketingSection from '@/components/MarketingSection';
import FAQSection from '@/components/FAQSection';
import FooterNavigation from '@/components/FooterNavigation';
import Footer from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function Home() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="overflow-x-hidden max-w-full">
      <Navigation />
      <main className="overflow-x-hidden max-w-full">
        <Hero />
        <Listings />
        <Auctions />
        <PopularCities />
        <ToolsSection />
        <ArticlesSection />
        <MarketingSection />
        <FAQSection />
        <FooterNavigation />
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

