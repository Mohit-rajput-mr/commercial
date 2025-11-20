'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCityMarketData } from '@/data/cityMarketData';
import MarketAnalysisPage from '@/components/MarketAnalysisPage';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CityMarketData } from '@/types/market';

export default function CityMarketPage() {
  const params = useParams();
  const citySlug = params?.city as string;
  const [cityData, setCityData] = useState<CityMarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (citySlug) {
      const data = getCityMarketData(citySlug);
      setCityData(data);
      setLoading(false);
    }
  }, [citySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[50px] w-full"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mx-auto mb-4"></div>
            <p className="text-custom-gray">Loading market data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[50px] w-full"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-primary-black mb-4">City Not Found</h1>
            <p className="text-custom-gray mb-8">The market page for this city is not available.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-accent-yellow text-primary-black font-semibold rounded-lg hover:bg-accent-yellow/90 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[50px] w-full"></div>
      <MarketAnalysisPage cityData={cityData} />
      <Footer />
    </div>
  );
}

