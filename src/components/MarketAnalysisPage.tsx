'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList,
} from 'recharts';
import { CityMarketData } from '@/types/market';
import { getCityContent } from '@/data/marketContent';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  DollarSign,
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface MarketAnalysisPageProps {
  cityData: CityMarketData;
}

const COLORS = {
  office: '#3B82F6',
  multifamily: '#10B981',
  industrial: '#F59E0B',
  retail: '#EF4444',
};

const getCapRateColor = (rate: number) => {
  if (rate <= 5) return 'text-green-600';
  if (rate <= 7) return 'text-yellow-600';
  if (rate <= 9) return 'text-orange-600';
  return 'text-red-600';
};

const getCapRateGrade = (rate: number) => {
  if (rate <= 5) return 'Core';
  if (rate <= 7) return 'Core Plus';
  if (rate <= 9) return 'Value Add';
  return 'Opportunistic';
};

export default function MarketAnalysisPage({ cityData }: MarketAnalysisPageProps) {
  const router = useRouter();
  const [activePropertyTab, setActivePropertyTab] = useState<'Office' | 'Multifamily' | 'Industrial' | 'Retail'>('Office');
  const [isMounted, setIsMounted] = useState(false);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 500 });
  const [inlineChartWidth, setInlineChartWidth] = useState(600);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const inlineChartContainerRef = useRef<HTMLDivElement>(null);
  const content = getCityContent(cityData.slug);

  // Ensure component is mounted on client before rendering charts
  useEffect(() => {
    // Calculate chart dimensions based on container or window
    const updateDimensions = () => {
      let width = 800; // default
      if (typeof window !== 'undefined') {
        // Use window width minus padding
        width = Math.min(window.innerWidth - 64, 1200);
      }
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        if (containerWidth > 0) {
          width = containerWidth;
        }
      }
      setChartDimensions({ width: Math.max(width, 400), height: 500 });

      // Calculate inline chart width (for side-by-side charts)
      if (inlineChartContainerRef.current) {
        const inlineWidth = inlineChartContainerRef.current.offsetWidth;
        if (inlineWidth > 0) {
          setInlineChartWidth(Math.max(inlineWidth, 400));
        } else if (typeof window !== 'undefined') {
          // Fallback: calculate based on window width and grid
          const isLargeScreen = window.innerWidth >= 1024;
          const calculatedWidth = isLargeScreen 
            ? Math.min((window.innerWidth - 128) / 2, 600)
            : Math.min(window.innerWidth - 64, 600);
          setInlineChartWidth(Math.max(calculatedWidth, 400));
        }
      } else if (typeof window !== 'undefined') {
        const isLargeScreen = window.innerWidth >= 1024;
        const calculatedWidth = isLargeScreen 
          ? Math.min((window.innerWidth - 128) / 2, 600)
          : Math.min(window.innerWidth - 64, 600);
        setInlineChartWidth(Math.max(calculatedWidth, 400));
      }
    };

    // Small delay to ensure containers are fully rendered and measured
    const timer = setTimeout(() => {
      updateDimensions();
      setIsMounted(true);
    }, 300);

    // Update on resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
    }
    
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  const handleViewProperties = () => {
    const location = `${cityData.name}`;
    router.push(`/unified-search?location=${encodeURIComponent(location)}&status=ForSale`);
  };

  // Prepare chart data
  const capRateChartData = useMemo(() => {
    const years = Array.from(new Set([
      ...cityData.capRates.office.map(d => d.year),
      ...cityData.capRates.multifamily.map(d => d.year),
      ...cityData.capRates.industrial.map(d => d.year),
      ...cityData.capRates.retail.map(d => d.year),
    ])).sort();

    return years.map(year => ({
      year,
      Office: cityData.capRates.office.find(d => d.year === year)?.value || null,
      Multifamily: cityData.capRates.multifamily.find(d => d.year === year)?.value || null,
      Industrial: cityData.capRates.industrial.find(d => d.year === year)?.value || null,
      Retail: cityData.capRates.retail.find(d => d.year === year)?.value || null,
    }));
  }, [cityData]);

  const currentCapRates = useMemo(() => {
    const latestYear = Math.max(
      ...cityData.capRates.office.map(d => d.year),
      ...cityData.capRates.multifamily.map(d => d.year),
      ...cityData.capRates.industrial.map(d => d.year),
      ...cityData.capRates.retail.map(d => d.year)
    );
    return [
      {
        type: 'Office',
        value: cityData.capRates.office.find(d => d.year === latestYear)?.value || 0,
        color: COLORS.office,
      },
      {
        type: 'Multifamily',
        value: cityData.capRates.multifamily.find(d => d.year === latestYear)?.value || 0,
        color: COLORS.multifamily,
      },
      {
        type: 'Industrial',
        value: cityData.capRates.industrial.find(d => d.year === latestYear)?.value || 0,
        color: COLORS.industrial,
      },
      {
        type: 'Retail',
        value: cityData.capRates.retail.find(d => d.year === latestYear)?.value || 0,
        color: COLORS.retail,
      },
    ];
  }, [cityData]);

  const vacancyData = useMemo(() => [
    { type: 'Office', value: cityData.vacancyRates.office },
    { type: 'Multifamily', value: cityData.vacancyRates.multifamily },
    { type: 'Industrial', value: cityData.vacancyRates.industrial },
    { type: 'Retail', value: cityData.vacancyRates.retail },
  ], [cityData]);

  const transactionData = useMemo(() => [
    { year: '2023', value: parseFloat(cityData.transactionVolume['2023'].replace(/[^0-9.]/g, '')) || 0 },
    { year: '2024', value: parseFloat(cityData.transactionVolume['2024'].replace(/[^0-9.]/g, '')) || 0 },
    { year: '2025', value: parseFloat(cityData.transactionVolume['2025'].replace(/[^0-9.]/g, '')) || 0 },
  ], [cityData]);

  const cmbsData = cityData.cmbsMaturity ? [
    { name: 'Office', value: cityData.cmbsMaturity.office, color: COLORS.office },
    { name: 'Multifamily', value: cityData.cmbsMaturity.multifamily, color: COLORS.multifamily },
    { name: 'Retail', value: cityData.cmbsMaturity.retail, color: COLORS.retail },
    { name: 'Industrial', value: cityData.cmbsMaturity.industrial, color: COLORS.industrial },
    { name: 'Hotel', value: cityData.cmbsMaturity.hotel, color: '#8B5CF6' },
  ] : [];

  const avgCapRate = useMemo(() => {
    const latestYear = Math.max(...cityData.capRates.office.map(d => d.year));
    const rates = [
      cityData.capRates.office.find(d => d.year === latestYear)?.value || 0,
      cityData.capRates.multifamily.find(d => d.year === latestYear)?.value || 0,
      cityData.capRates.industrial.find(d => d.year === latestYear)?.value || 0,
      cityData.capRates.retail.find(d => d.year === latestYear)?.value || 0,
    ];
    return rates.reduce((a, b) => a + b, 0) / rates.length;
  }, [cityData]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 md:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 sm:h-64 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 md:mb-12 bg-gray-800"
      >
        {cityData.imageUrl ? (
          <Image
            src={cityData.imageUrl}
            alt={cityData.name}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1440px"
            onError={(e) => {
              // Hide image on error, show gradient background instead
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4">{cityData.name}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
              <div className="text-white/80 text-xs sm:text-sm">Avg Cap Rate</div>
              <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getCapRateColor(avgCapRate)}`}>
                {avgCapRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
              <div className="text-white/80 text-xs sm:text-sm">Market Value</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{cityData.overview.totalValue}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
              <div className="text-white/80 text-xs sm:text-sm">Population</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{cityData.overview.population.split('(')[0]}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
              <div className="text-white/80 text-xs sm:text-sm">Unemployment</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{cityData.overview.unemployment}%</div>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 text-white/60 text-xs sm:text-sm flex items-center gap-2">
            <Calendar size={14} className="sm:w-4 sm:h-4" />
            Last updated: Q3 2025
          </div>
        </div>
      </motion.div>

      {/* Market Introduction */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
        >
          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
              {content.marketIntroduction.researchApproach}
            </p>
            <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
              {content.marketIntroduction.marketContext}
            </p>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
              {content.marketIntroduction.performanceInsights}
            </p>
          </div>
        </motion.div>
      )}

      {/* Market Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12"
      >
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Building2 className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-black">Market Size</h3>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black">{cityData.overview.marketSize}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <DollarSign className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-black">GDP Contribution</h3>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black">{cityData.overview.gdp}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Users className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-black">Employment</h3>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black">{cityData.overview.employment}</p>
        </div>
      </motion.div>

      {/* 10-Year Cap Rate Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 sm:mb-6 md:mb-8 relative overflow-visible"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 relative z-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black">10-Year Cap Rate Trends</h2>
          <BarChart3 className="text-accent-yellow w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </div>
        <div 
          ref={chartContainerRef}
          className="w-full relative z-10" 
          style={{ height: '500px', minHeight: '500px', minWidth: '100%', width: '100%', display: 'block' }}
        >
          {isMounted && capRateChartData.length > 0 ? (
            <div style={{ width: '100%', height: '500px' }}>
              <LineChart 
                width={chartDimensions.width} 
                height={500} 
                data={capRateChartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 14 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{ fontSize: 14 }}
                  label={{ value: 'Cap Rate %', angle: -90, position: 'insideLeft', style: { fontSize: '14px' } }} 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '12px', 
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}
                  wrapperStyle={{ zIndex: 1000 }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="Office" stroke={COLORS.office} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Multifamily" stroke={COLORS.multifamily} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Industrial" stroke={COLORS.industrial} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Retail" stroke={COLORS.retail} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-yellow mx-auto mb-2"></div>
                <div className="text-gray-400 text-sm">Loading chart...</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Broker's Insights: Market Outlook */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Building2 className="text-accent-yellow mt-1 flex-shrink-0" size={28} />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">Broker&apos;s Insights: {cityData.name} Market Outlook</h2>
              <p className="text-lg leading-relaxed italic text-blue-100">
                &quot;{content.brokerInsights.marketOutlook}&quot;
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Cap Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 sm:mb-6 md:mb-8 relative overflow-visible"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6 relative z-20">Current Cap Rates (Q3 2025)</h2>
        <div className="w-full relative z-10" style={{ height: '450px', minHeight: '450px', minWidth: '100%', width: '100%', display: 'block' }}>
          {isMounted && currentCapRates.length > 0 ? (
            <div style={{ width: '100%', height: '450px' }}>
              <BarChart 
                width={chartDimensions.width} 
                height={450} 
                data={currentCapRates} 
                layout="vertical" 
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 14 }}
                />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  stroke="#6B7280" 
                  width={100}
                  tick={{ fontSize: 14 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '12px', 
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}
                  wrapperStyle={{ zIndex: 1000 }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {currentCapRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-yellow mx-auto mb-2"></div>
                <div className="text-gray-400 text-sm">Loading chart...</div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {currentCapRates.map((item) => (
            <div key={item.type} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">{item.type}</div>
              <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getCapRateColor(item.value)}`}>
                {item.value.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">{getCapRateGrade(item.value)}</div>
            </div>
          ))}
        </div>
      </motion.div>

        {/* First Quarter Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">Q1 2025 Sector Analysis</h2>
          <p className="text-gray-700 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
            For the first quarter of 2025, we conducted a sector-specific analysis for new issuances in {cityData.name}, which revealed the following findings:
          </p>
          
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="border-l-4 border-blue-500 pl-4 sm:pl-5 md:pl-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-black mb-2 sm:mb-3">Office Sector</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                The average cap rate for office properties in {cityData.name} stands at{' '}
                <strong className="text-primary-black">{currentCapRates.find(r => r.type === 'Office')?.value.toFixed(1)}%</strong>, with vacancy rates at{' '}
                <strong className="text-primary-black">{cityData.vacancyRates.office}%</strong>. 
                {cityData.name === 'New York City' && ' Manhattan office vacancy at 14.2% but strong net absorption of 7.5M SF in first half 2025. Class A+ buildings achieving 85% mid-week attendance.'}
                {cityData.name === 'Los Angeles' && ' Downtown LA faces 23.9% vacancy (up 30bps QoQ), while Century City maintains strength with 6.5% cap rates.'}
                {cityData.name === 'Miami' && ' Brickell serves as the strongest submarket with 6.5% cap rates, while overall vacancy sits at 15.2% with 2.5M SF in pipeline.'}
                {cityData.name === 'Houston' && ' Energy sector volatility drives 20.5% vacancy, with Energy Corridor at 9.0% cap rates versus Galleria at 7.8%.'}
                {cityData.name === 'Chicago' && ' Loop/CBD maintains 6.5% cap rates with 15% vacancy, while River North offers value-add opportunities at 7.0%.'}
                {cityData.name === 'Phoenix' && ' Downtown Phoenix revitalization efforts continue, with Scottsdale commanding premium 7.0% cap rates versus market average 8.2%.'}
                {cityData.name === 'Philadelphia' && ' Center City office at 7.5% cap rates with Navy Yard emerging as innovation district at 7.8%.'}
                {cityData.name === 'San Antonio' && ' Medical Center represents strongest submarket at 8.0% cap rates, with overall market at 9.2% average.'}
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 sm:pl-5 md:pl-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-black mb-2 sm:mb-3">Multifamily Sector</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                Multifamily properties in {cityData.name} trade at{' '}
                <strong className="text-primary-black">{currentCapRates.find(r => r.type === 'Multifamily')?.value.toFixed(1)}%</strong> average cap rate, with vacancy at{' '}
                <strong className="text-primary-black">{cityData.vacancyRates.multifamily}%</strong>. 
                {cityData.name === 'New York City' && ' Q1 2025 cap rates range from 4.74% (Class A) to 5.38% (Class C), with outer boroughs offering best value.'}
                {cityData.name === 'Los Angeles' && ' San Fernando Valley and South Bay-Long Beach represent tight markets with 5.1% cap rates.'}
                {cityData.name === 'Miami' && ' Luxury condo market averages $650/SF, with international buyer demand supporting pricing.'}
                {cityData.name === 'Houston' && ' The Woodlands and Katy submarkets offer defensive positioning at 6.0-6.3% cap rates.'}
                {cityData.name === 'Chicago' && ' Lincoln Park and Gold Coast command premium 5.5% cap rates with lakefront appeal.'}
                {cityData.name === 'Phoenix' && ' Tempe and Scottsdale represent tight markets at 6.0-6.5% caps, supported by population growth.'}
                {cityData.name === 'Philadelphia' && ' University City student housing strength drives 5.8% cap rates, with Center City at 6.0%.'}
                {cityData.name === 'San Antonio' && ' Stone Oak master-planned community offers 6.5% cap rates with strong fundamentals.'}
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 sm:pl-5 md:pl-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-black mb-2 sm:mb-3">Industrial Sector</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                Industrial properties in {cityData.name} achieve{' '}
                <strong className="text-primary-black">{currentCapRates.find(r => r.type === 'Industrial')?.value.toFixed(1)}%</strong> average cap rates, with vacancy at{' '}
                <strong className="text-primary-black">{cityData.vacancyRates.industrial}%</strong>. 
                {cityData.name === 'New York City' && ' Q1 2025 cap rates range 4.84-6.71% across classes, with port access premium in New Jersey.'}
                {cityData.name === 'Los Angeles' && ' Port-driven demand supports 5.5% cap rates near San Pedro/Long Beach, with Inland Empire as primary distribution hub.'}
                {cityData.name === 'Miami' && ' PortMiami expansion and nearshoring trends benefit industrial at 6.5% cap rates.'}
                {cityData.name === 'Houston' && ' Ship Channel proximity commands 6.2% cap rates for petrochemical-adjacent facilities.'}
                {cityData.name === 'Chicago' && ' O\'Hare corridor offers 5.5% cap rates with 1.21B SF inventory as Midwest logistics hub.'}
                {cityData.name === 'Phoenix' && ' Led nation with 22.4M SF pipeline, West Valley industrial at 5.8% caps with semiconductor demand.'}
                {cityData.name === 'Philadelphia' && ' I-95 corridor strength offers 6.8% cap rates with proximity to NYC and DC distribution.'}
                {cityData.name === 'San Antonio' && ' I-35 corridor for Mexico trade commands 6.8% cap rates with USMCA tailwinds.'}
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4 sm:pl-5 md:pl-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-black mb-2 sm:mb-3">Retail Sector</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                Retail properties in {cityData.name} trade at{' '}
                <strong className="text-primary-black">{currentCapRates.find(r => r.type === 'Retail')?.value.toFixed(1)}%</strong> average cap rate, with vacancy at{' '}
                <strong className="text-primary-black">{cityData.vacancyRates.retail}%</strong>. 
                {cityData.name === 'New York City' && ' Prime locations command $150-250/SF asking rents, with Fifth Avenue and SoHo maintaining premium pricing.'}
                {cityData.name === 'Los Angeles' && ' Beverly Hills and Robertson Boulevard trophy retail at $3.11/SF NNN with 5.7% vacancy.'}
                {cityData.name === 'Miami' && ' Brickell City Centre and Aventura Mall success, with Lincoln Road and Design District strength.'}
                {cityData.name === 'Houston' && ' Galleria serves as prime retail hub at 7.5% cap rates, with big-box suburban strength.'}
                {cityData.name === 'Chicago' && ' Magnificent Mile tourist retail, with grocery-anchored centers performing at 6.8-7.0% caps.'}
                {cityData.name === 'Phoenix' && ' Scottsdale Fashion Square strength, with outdoor center preference in climate.'}
                {cityData.name === 'Philadelphia' && ' King of Prussia as major retail destination, with Rittenhouse Row urban retail.'}
                {cityData.name === 'San Antonio' && ' River Walk tourist retail, with La Cantera and Alamo Quarry Market success.'}
              </p>
            </div>
          </div>
        </motion.div>

      {/* Vacancy Rates & Transaction Volume - Inline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div ref={inlineChartContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Vacancy Rates */}
          <div className="relative overflow-visible">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6 relative z-20">Vacancy Rates</h2>
            <div className="w-full relative z-10" style={{ height: '450px', minHeight: '450px', minWidth: '100%', width: '100%', display: 'block' }}>
              {isMounted && vacancyData.length > 0 ? (
                <div style={{ width: '100%', height: '450px' }}>
                  <AreaChart 
                    width={inlineChartWidth} 
                    height={450} 
                    data={vacancyData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="type" 
                      stroke="#6B7280" 
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      tick={{ fontSize: 14 }}
                      label={{ value: 'Vacancy %', angle: -90, position: 'insideLeft', style: { fontSize: '14px' } }} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '12px', 
                        fontSize: '14px',
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000
                      }}
                      wrapperStyle={{ zIndex: 1000 }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6}>
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(value: any) => typeof value === 'number' ? `${value.toFixed(1)}%` : value}
                        style={{ fontSize: '14px', fontWeight: 'bold', fill: '#1F2937' }}
                      />
                    </Area>
                  </AreaChart>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-yellow mx-auto mb-2"></div>
                    <div className="text-gray-400 text-sm">Loading chart...</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Volume */}
          <div className="relative overflow-visible">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6 relative z-20">Transaction Volume</h2>
            <div className="w-full relative z-10" style={{ height: '450px', minHeight: '450px', minWidth: '100%', width: '100%', display: 'block' }}>
              {isMounted && transactionData.length > 0 ? (
                <div style={{ width: '100%', height: '450px' }}>
                  <BarChart 
                    width={inlineChartWidth} 
                    height={450} 
                    data={transactionData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#6B7280" 
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      tick={{ fontSize: 14 }}
                      label={{ value: 'Volume ($B)', angle: -90, position: 'insideLeft', style: { fontSize: '14px' } }} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '12px', 
                        fontSize: '14px',
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000
                      }}
                      wrapperStyle={{ zIndex: 1000 }}
                      formatter={(value: number) => `$${value.toFixed(1)}B`}
                      cursor={{ fill: 'rgba(255, 215, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#FFD700" radius={[4, 4, 0, 0]}>
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(1)}B` : value}
                        style={{ fontSize: '14px', fontWeight: 'bold', fill: '#1F2937' }}
                      />
                    </Bar>
                  </BarChart>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-yellow mx-auto mb-2"></div>
                    <div className="text-gray-400 text-sm">Loading chart...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Understanding CMBS Educational Content */}
      {cityData.cmbsMaturity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-blue-50 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-blue-200"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <Lightbulb className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black mb-3 sm:mb-4">Understanding CMBS</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-semibold text-primary-black mb-2 text-sm sm:text-base md:text-lg">What is CMBS?</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Commercial Mortgage-Backed Securities (CMBS) are bonds backed by commercial real estate loans. When multiple property loans are pooled together and sold to investors as securities, they create CMBS. This market represents approximately $1.2 trillion in outstanding debt across U.S. commercial real estate.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-black mb-2 text-sm sm:text-base md:text-lg">Why Maturities Matter</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    A maturity wall occurs when a large volume of loans comes due within a short timeframe. In {cityData.name}, {cityData.cmbsMaturity.total} in CMBS loans mature in 2024-2025. Properties financed at 3-4% in 2014-2015 now face refinancing at 6-7%+, creating significant payment shock and potential distress.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-black mb-2 text-sm sm:text-base md:text-lg">Property Type Breakdown</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    The pie chart below shows how maturing debt is distributed across property types. Office properties represent {cityData.cmbsMaturity.office}% of maturities, reflecting the sector&apos;s challenges. Multifamily at {cityData.cmbsMaturity.multifamily}% benefits from stronger fundamentals, while retail ({cityData.cmbsMaturity.retail}%) and industrial ({cityData.cmbsMaturity.industrial}%) face varying refinancing challenges.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <h3 className="font-semibold text-primary-black mb-2 text-sm sm:text-base md:text-lg">Opportunity and Risk</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    For borrowers, maturing loans at higher rates reduce cash flow and property values. For opportunistic investors, distressed assets unable to refinance create acquisition opportunities at attractive entry points. Properties with strong fundamentals and stable cash flows should refinance successfully, while those with high vacancy or declining values may face challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CMBS Maturity */}
      {cityData.cmbsMaturity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-4 sm:mb-6 md:mb-8 relative overflow-visible"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6 relative z-20">CMBS Maturity Wall (2024-2025)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="w-full relative z-10" style={{ height: '450px', minHeight: '450px', minWidth: '100%', width: '100%', display: 'block' }}>
              {isMounted && cmbsData.length > 0 ? (
                <div style={{ width: '100%', height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <PieChart width={400} height={400}>
                    <Pie
                      data={cmbsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : '0%'}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cmbsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '12px', 
                        fontSize: '14px',
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000
                      }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                  </PieChart>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-yellow mx-auto mb-2"></div>
                    <div className="text-gray-400 text-sm">Loading chart...</div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Maturing</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black">{cityData.cmbsMaturity.total}</div>
              </div>
              {cmbsData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-primary-black text-sm sm:text-base">{item.name}</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-primary-black">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Broker's Insights: Maturity Wall */}
      {content && cityData.cmbsMaturity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Building2 className="text-accent-yellow mt-1 flex-shrink-0" size={28} />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">Navigating the Maturity Wall: Broker Strategy</h2>
              <p className="text-lg leading-relaxed text-blue-100">
                {content.brokerInsights.maturityWall}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submarket Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">Key Submarkets</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">Submarket</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">Office Cap Rate</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">Office Vacancy</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">Multifamily Cap Rate</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">Industrial Cap Rate</th>
              </tr>
            </thead>
            <tbody>
              {cityData.submarkets.map((submarket, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-semibold text-primary-black">{submarket.name}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    {submarket.office ? (
                      <span className={getCapRateColor(submarket.office.capRate)}>
                        {submarket.office.capRate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    {submarket.office?.vacancy ? `${submarket.office.vacancy}%` : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    {submarket.multifamily ? (
                      <span className={getCapRateColor(submarket.multifamily.capRate)}>
                        {submarket.multifamily.capRate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    {submarket.industrial ? (
                      <span className={getCapRateColor(submarket.industrial.capRate)}>
                        {submarket.industrial.capRate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submarket Deep Dives */}
        {content && content.submarketDetails.length > 0 && (
          <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-6 md:mt-8">
            {content.submarketDetails.map((detail, index) => {
              const submarketData = cityData.submarkets.find(s => s.name === detail.name);
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary-black mb-2 sm:mb-3">{detail.name}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm">Location & Character:</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">{detail.location}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm">Current Performance:</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">{detail.performance}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm">Drivers & Outlook:</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">{detail.drivers}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Asking Rents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">Asking Rents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Office</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-primary-black">{cityData.askingRents.office}</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Multifamily</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-primary-black">{cityData.askingRents.multifamily}</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Industrial</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-primary-black">{cityData.askingRents.industrial}</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Retail</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-primary-black">{cityData.askingRents.retail}</div>
          </div>
        </div>
      </motion.div>

      {/* Market Drivers / Characteristics */}
      {(cityData.marketDrivers || cityData.marketCharacteristics || cityData.growthDrivers) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">Market Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {cityData.marketDrivers && (
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Market Drivers</h3>
                <ul className="space-y-2">
                  {cityData.marketDrivers.map((driver, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="text-green-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cityData.marketCharacteristics && (
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Market Characteristics</h3>
                <ul className="space-y-2">
                  {cityData.marketCharacteristics.map((char, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Building2 className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cityData.growthDrivers && (
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Growth Drivers</h3>
                <ul className="space-y-2">
                  {cityData.growthDrivers.map((driver, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="text-orange-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Historical Performance */}
      {cityData.historicalPerformance && cityData.historicalPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">10-Year Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {cityData.historicalPerformance.map((perf, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">{perf.propertyType}</div>
                <div className={`text-lg sm:text-xl md:text-2xl font-bold ${perf.appreciation.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {perf.appreciation}
                </div>
                <div className="text-xs text-gray-500 mt-1">{perf.period}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk and Opportunity Assessment */}
      {content && content.riskOpportunity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-gray-100"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-4 sm:mb-5 md:mb-6">Risk & Opportunity Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-5 md:mb-6">
            <div className="bg-green-50 rounded-lg p-4 sm:p-5 md:p-6 border border-green-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800">Strengths</h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {content.riskOpportunity.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 sm:p-5 md:p-6 border border-yellow-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <AlertCircle className="text-yellow-600" size={24} />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-800">Challenges</h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {content.riskOpportunity.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 sm:p-5 md:p-6 border border-blue-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <TrendingUp className="text-blue-600" size={24} />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">Opportunities</h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {content.riskOpportunity.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-4 sm:p-5 md:p-6 border border-red-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800">Threats</h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {content.riskOpportunity.threats.map((threat, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black mb-3 sm:mb-4">Broker&apos;s Balanced View</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              {content.riskOpportunity.balancedView}
            </p>
          </div>
        </motion.div>
      )}

      {/* Broker's Insights: Investment Strategy */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Building2 className="text-accent-yellow mt-1 flex-shrink-0" size={28} />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">2025-2027 Investment Strategy for {cityData.name}</h2>
              <p className="text-lg leading-relaxed text-blue-100">
                {content.brokerInsights.investmentStrategy}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* View Properties Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-r from-primary-black to-gray-800 rounded-lg sm:rounded-xl shadow-lg p-5 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">Explore Properties in {cityData.name}</h2>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-4 sm:mb-5 md:mb-6">
              Browse available commercial real estate listings in {cityData.name} based on the market analysis above.
            </p>
            <button
              onClick={handleViewProperties}
              className="inline-flex items-center gap-2 bg-accent-yellow text-primary-black px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-yellow-400 transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              View Properties
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <Building2 size={120} className="text-accent-yellow/20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

