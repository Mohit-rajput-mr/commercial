'use client';

export const dynamic = 'force-dynamic';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import PopularCities from '@/components/PopularCities';
import SmartSpaceEstimationTool from '@/components/SmartSpaceEstimationTool';
import ArticlesSection from '@/components/ArticlesSection';
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
        <PopularCities />
        <SmartSpaceEstimationTool />
        <ArticlesSection />
        <FAQSection />
        <FooterNavigation />
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

