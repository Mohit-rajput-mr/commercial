'use client';

export const dynamic = 'force-dynamic';

import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import PopularCities from '@/components/PopularCities';
import SmartSpaceEstimationTool from '@/components/SmartSpaceEstimationTool';
import ArticlesSection from '@/components/ArticlesSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function Home() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="overflow-x-hidden max-w-full">
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
    </div>
  );
}

