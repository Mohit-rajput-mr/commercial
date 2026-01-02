'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Globe, MapPin, Smartphone, Monitor, Tablet, Calendar, 
  TrendingUp, Activity, Eye, MousePointerClick, ChevronRight, X,
  Clock, ExternalLink, Link as LinkIcon, FileText, Info
} from 'lucide-react';
import { normalizeUrl } from '@/lib/url-normalizer';

interface Visitor {
  id: string;
  session_id: string;
  ip_address: string;
  country: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  visit_count: number;
  first_visit_at: string;
  last_visit_at: string;
  created_at: string;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  language?: string;
  screen_width?: number;
  screen_height?: number;
  averageTimeSpent?: number;
}

interface VisitorDetail {
  id: string;
  session_id: string;
  ip_address: string;
  country: string;
  city: string;
  region: string;
  device_type: string;
  browser: string;
  os: string;
  visit_count: number;
  first_visit_at: string;
  last_visit_at: string;
  created_at: string;
  page_url: string;
  page_title: string;
  referrer: string;
  language: string;
  screen_width: number;
  screen_height: number;
  pageVisits: Array<{
    id: string;
    page_url: string;
    page_title: string;
    referrer: string;
    time_spent_seconds: number;
    visited_at: string;
  }>;
  linkClicks: Array<{
    id: string;
    link_url: string;
    link_text: string;
    clicked_at: string;
  }>;
  totalTimeSpent: number;
  totalPagesVisited: number;
  totalLinksClicked: number;
}

interface AnalyticsStats {
  totalVisitors: number;
  uniqueVisitors: number;
  averageTimeSpent?: number;
  topCountries: Array<{ country: string; count: number; code: string }>;
  topCities: Array<{ city: string; count: number }>;
  deviceCounts: Record<string, number>;
  browserCounts: Array<{ browser: string; count: number }>;
  osCounts: Array<{ os: string; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
}

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [adminVisits, setAdminVisits] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | '90days' | 'year' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetail | null>(null);
  const [loadingVisitorDetail, setLoadingVisitorDetail] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>({});
  const [updatingDevices, setUpdatingDevices] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let statsUrl = `/api/admin/analytics/stats?period=${period}`;
      let visitorsUrl = `/api/admin/analytics/visitors?page=1&limit=50&period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        statsUrl += `&startDate=${startDate}&endDate=${endDate}`;
        visitorsUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const statsResponse = await fetch(statsUrl);
      
      if (!statsResponse.ok) {
        throw new Error(`Stats API error: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      } else {
        setError(statsData.error || 'Failed to load analytics stats');
        setStats({
          totalVisitors: 0,
          uniqueVisitors: 0,
          averageTimeSpent: 0,
          topCountries: [],
          topCities: [],
          deviceCounts: {},
          browserCounts: [],
          osCounts: [],
          timeSeries: [],
        });
      }

      const visitorsResponse = await fetch(visitorsUrl);
      
      if (!visitorsResponse.ok) {
        throw new Error(`Visitors API error: ${visitorsResponse.status}`);
      }
      
      const visitorsData = await visitorsResponse.json();

      if (visitorsData.success) {
        // Filter out admin visits from the list
        const nonAdminVisitors = (visitorsData.visitors || []).filter((visitor: Visitor) => {
          // Check if visitor has admin page visits
          const pageUrl = visitor.page_url || '';
          return !pageUrl.includes('/admin') && !pageUrl.includes('admin');
        });
        
        setVisitors(nonAdminVisitors);
        
        // Load admin visits separately
        const adminVisitsResponse = await fetch('/api/admin/visitors?excludeAdmin=true');
        if (adminVisitsResponse.ok) {
          const adminData = await adminVisitsResponse.json();
          if (adminData.success) {
            setAdminVisits(adminData.adminVisits || []);
          }
        }
        
        // Auto-update device types for visitors with small screen sizes
        autoUpdateDeviceTypes();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      setStats({
        totalVisitors: 0,
        uniqueVisitors: 0,
        averageTimeSpent: 0,
        topCountries: [],
        topCities: [],
        deviceCounts: {},
        browserCounts: [],
        osCounts: [],
        timeSeries: [],
      });
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate]);

  const handleVisitorClick = async (visitorId: string) => {
    setLoadingVisitorDetail(true);
    try {
      const response = await fetch(`/api/admin/analytics/visitor/${visitorId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedVisitor(data.visitor);
      } else {
        alert('Failed to load visitor details');
      }
    } catch (error) {
      console.error('Error loading visitor details:', error);
      alert('Error loading visitor details');
    } finally {
      setLoadingVisitorDetail(false);
    }
  };

  const toggleDropdown = (key: string) => {
    setShowDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatAverageTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const autoUpdateDeviceTypes = async () => {
    try {
      setUpdatingDevices(true);
      const response = await fetch('/api/admin/analytics/visitors/update-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.updated > 0) {
        // Reload visitors to show updated device types
        let visitorsUrl = `/api/admin/analytics/visitors?page=1&limit=50&period=${period}`;
        if (period === 'custom' && startDate && endDate) {
          visitorsUrl += `&startDate=${startDate}&endDate=${endDate}`;
        }
        
        const visitorsResponse = await fetch(visitorsUrl);
        if (visitorsResponse.ok) {
          const visitorsData = await visitorsResponse.json();
          if (visitorsData.success) {
            setVisitors(visitorsData.visitors || []);
          }
        }
      }
    } catch (error) {
      console.error('Error auto-updating device types:', error);
    } finally {
      setUpdatingDevices(false);
    }
  };

  const deviceChartData = stats?.deviceCounts ? Object.entries(stats.deviceCounts).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalDevices = deviceChartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Visitor Analytics
              </h1>
              <p className="text-sm text-gray-600">Track and analyze your website visitors</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700 text-sm font-medium flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Visitor Analytics Filter Section */}
          <div className="bg-white border border-gray-300 p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Period:</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handlePeriodChange('today')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === 'today'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === 'week'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === 'month'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => handlePeriodChange('90days')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === '90days'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                90 Days
              </button>
              <button
                onClick={() => handlePeriodChange('all')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === 'all'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === 'custom'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Custom Range
              </button>
            </div>

            {/* Custom Date Range Picker */}
            {period === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-gray-300 pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="px-3 py-2 border border-gray-300 text-sm"
                  />
                </div>
                {startDate && endDate && (
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-800 text-white text-sm font-medium hover:bg-gray-900"
                  >
                    Apply
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 mb-4">
              <p className="font-semibold text-sm">Error loading analytics:</p>
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-200">
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('avgTimeSpent')}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                  {showDropdowns.avgTimeSpent && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600">Average time spent per visitor session</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">Avg. Time Spent</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageTimeSpent !== undefined ? formatAverageTime(stats.averageTimeSpent) : '0s'}
              </p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-200">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('totalVisitors')}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                  {showDropdowns.totalVisitors && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600">Total page visits across all sessions</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">Total Visitors</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-200">
                  <Activity className="w-5 h-5 text-gray-700" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('uniqueVisitors')}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                  {showDropdowns.uniqueVisitors && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600">Unique sessions (distinct visitors)</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">Unique Visitors</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-200">
                  <Globe className="w-5 h-5 text-gray-700" />
                </div>
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">Top Country</h3>
              <p className="text-lg font-bold text-gray-900">{stats.topCountries[0]?.country || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.topCountries[0]?.count || 0} visitors</p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-200">
                  <Eye className="w-5 h-5 text-gray-700" />
                </div>
                <MousePointerClick className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">Avg. Visits</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVisitors > 0 && stats.uniqueVisitors > 0 ? (stats.totalVisitors / stats.uniqueVisitors).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        )}

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Visitors Over Time List */}
          {stats && stats.timeSeries.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <TrendingUp className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Visitors Over Time</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('timeSeries')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {stats.timeSeries.length} days
                  </button>
                  {showDropdowns.timeSeries && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total visitors: {stats.timeSeries.reduce((sum, d) => sum + d.count, 0)}</p>
                      <p className="text-xs text-gray-600">Showing last 30 days</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {stats.timeSeries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.date}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device Types List */}
          {deviceChartData.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <Smartphone className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Device Types</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('devices')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {totalDevices} devices
                  </button>
                  {showDropdowns.devices && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total devices: {totalDevices}</p>
                      <p className="text-xs text-gray-600">Unique device types: {deviceChartData.length}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {deviceChartData.map((item, idx) => {
                  const percentage = totalDevices > 0 ? ((item.value / totalDevices) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Countries and Cities Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Top Countries List */}
          {stats && stats.topCountries.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <Globe className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Top Countries</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('countries')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {stats.topCountries.length} countries
                  </button>
                  {showDropdowns.countries && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total visitors: {stats.topCountries.reduce((sum, c) => sum + c.count, 0)}</p>
                      <p className="text-xs text-gray-600">Showing top {stats.topCountries.length} countries</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {stats.topCountries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.country}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Cities List */}
          {stats && stats.topCities.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <MapPin className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Top Cities</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('cities')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {stats.topCities.length} cities
                  </button>
                  {showDropdowns.cities && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total visitors: {stats.topCities.reduce((sum, c) => sum + c.count, 0)}</p>
                      <p className="text-xs text-gray-600">Showing top {stats.topCities.length} cities</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {stats.topCities.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.city}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Browsers and OS Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Browsers List */}
          {stats && stats.browserCounts.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <Monitor className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Browsers</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('browsers')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {stats.browserCounts.reduce((sum, b) => sum + b.count, 0)} users
                  </button>
                  {showDropdowns.browsers && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total users: {stats.browserCounts.reduce((sum, b) => sum + b.count, 0)}</p>
                      <p className="text-xs text-gray-600">Unique browsers: {stats.browserCounts.length}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {stats.browserCounts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.browser}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operating Systems List */}
          {stats && stats.osCounts.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200">
                    <Tablet className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Operating Systems</h2>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('os')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {stats.osCounts.reduce((sum, o) => sum + o.count, 0)} users
                  </button>
                  {showDropdowns.os && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Total users: {stats.osCounts.reduce((sum, o) => sum + o.count, 0)}</p>
                      <p className="text-xs text-gray-600">Unique OS: {stats.osCounts.length}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {stats.osCounts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.os}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Visitors Section with Split View (80/20) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Visitors Table - 80% (4 columns) */}
          <div className="lg:col-span-4 bg-white border border-gray-300 p-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-200">
                  <Users className="w-4 h-4 text-gray-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Recent Visitors</h2>
                <span className="text-xs text-gray-500">(Excluding Admin Visits)</span>
                {updatingDevices && (
                  <span className="text-xs text-gray-500 ml-2">Updating devices...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={autoUpdateDeviceTypes}
                  disabled={updatingDevices}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Auto-update device types for visitors with small screen sizes"
                >
                  {updatingDevices ? 'Updating...' : 'Auto-Update Devices'}
                </button>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('visitors')}
                    className="text-xs text-gray-600 font-medium hover:underline"
                  >
                    {visitors.length} visitors
                  </button>
                  {showDropdowns.visitors && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 p-2 z-10 shadow-lg">
                      <p className="text-xs text-gray-600 mb-1">Showing {visitors.length} recent visitors</p>
                      <p className="text-xs text-gray-600">Click any row to view details</p>
                      <p className="text-xs text-gray-500 mt-1">Device types auto-update on load</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border border-gray-300">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">IP Address</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Device</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Browser</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Visits</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Avg. Time Spent</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 border border-gray-300">
                        No visitors found
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      <tr 
                        key={visitor.id} 
                        onClick={() => handleVisitorClick(visitor.id)}
                        className="hover:bg-gray-100 cursor-pointer border border-gray-300"
                      >
                        <td className="px-3 py-2 text-sm text-gray-900 border border-gray-300">{visitor.ip_address}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 border border-gray-300">
                          {visitor.city && visitor.country ? `${visitor.city}, ${visitor.country}` : visitor.country || 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 capitalize border border-gray-300">{visitor.device_type || 'Unknown'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 border border-gray-300">{visitor.browser || 'Unknown'}</td>
                        <td className="px-3 py-2 text-sm font-semibold text-gray-900 border border-gray-300">{visitor.visit_count || 1}</td>
                        <td className="px-3 py-2 text-sm font-semibold text-gray-900 border border-gray-300">
                          {visitor.averageTimeSpent !== undefined ? formatTime(visitor.averageTimeSpent) : '0s'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500 border border-gray-300">
                          {new Date(visitor.last_visit_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Visits - 20% (1 column) */}
          <div className="lg:col-span-1 bg-white border border-gray-300 p-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-200">
                  <Users className="w-4 h-4 text-gray-700" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Admin Visits</h2>
              </div>
              <span className="text-xs text-gray-600">{adminVisits.length}</span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {adminVisits.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No admin visits</p>
              ) : (
                adminVisits.map((visitor) => (
                  <div 
                    key={visitor.id}
                    className="bg-gray-50 border border-gray-200 p-2 hover:bg-gray-100"
                  >
                    <div className="text-xs font-semibold text-gray-900 mb-1">
                      {visitor.ip_address}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {visitor.city && visitor.country ? `${visitor.city}` : visitor.country || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {visitor.device_type || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(visitor.last_visit_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-400 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-gray-200 border-b border-gray-400 p-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Visitor Details</h2>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1 hover:bg-gray-300 border border-gray-400"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {loadingVisitorDetail ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading visitor details...</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">IP Address</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedVisitor.ip_address}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Session ID</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{selectedVisitor.session_id}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Location</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedVisitor.city && selectedVisitor.country 
                        ? `${selectedVisitor.city}, ${selectedVisitor.region || ''} ${selectedVisitor.country}`.trim()
                        : selectedVisitor.country || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Device Type</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{selectedVisitor.device_type}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Browser</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedVisitor.browser}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Operating System</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedVisitor.os}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Screen Resolution</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedVisitor.screen_width && selectedVisitor.screen_height 
                        ? `${selectedVisitor.screen_width}x${selectedVisitor.screen_height}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Language</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedVisitor.language || 'N/A'}</p>
                  </div>
                </div>

                {/* Visit Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-gray-100 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Total Visits</p>
                    <p className="text-xl font-bold text-gray-900">{selectedVisitor.visit_count}</p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Pages Visited</p>
                    <p className="text-xl font-bold text-gray-900">{selectedVisitor.totalPagesVisited}</p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Links Clicked</p>
                    <p className="text-xl font-bold text-gray-900">{selectedVisitor.totalLinksClicked}</p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 p-3">
                    <p className="text-xs text-gray-600 mb-1">Time Spent</p>
                    <p className="text-xl font-bold text-gray-900">{formatTime(selectedVisitor.totalTimeSpent)}</p>
                  </div>
                </div>

                {/* Page Visits */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-700" />
                    Pages Visited ({selectedVisitor.pageVisits.length})
                  </h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {selectedVisitor.pageVisits.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 bg-gray-50 border border-gray-300">No page visits recorded</p>
                    ) : (
                      selectedVisitor.pageVisits.map((visit) => (
                        <div key={visit.id} className="bg-gray-50 border border-gray-300 p-3 hover:bg-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{visit.page_title || normalizeUrl(visit.page_url)}</p>
                              <p className="text-xs text-gray-600 mb-1">{normalizeUrl(visit.page_url)}</p>
                              {visit.referrer && (
                                <p className="text-xs text-gray-500">From: {normalizeUrl(visit.referrer)}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(visit.visited_at).toLocaleString()}
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatTime(visit.time_spent_seconds)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Link Clicks */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-gray-700" />
                    Links Clicked ({selectedVisitor.linkClicks.length})
                  </h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {selectedVisitor.linkClicks.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 bg-gray-50 border border-gray-300">No link clicks recorded</p>
                    ) : (
                      selectedVisitor.linkClicks.map((click) => {
                        const normalizedLinkUrl = normalizeUrl(click.link_url);
                        return (
                        <div key={click.id} className="bg-gray-50 border border-gray-300 p-3 hover:bg-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {click.link_text || normalizedLinkUrl}
                              </p>
                              <a 
                                href={normalizedLinkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-gray-600 hover:underline flex items-center gap-1"
                              >
                                {normalizedLinkUrl}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-xs text-gray-500 ml-4">
                              {new Date(click.clicked_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Visit Timeline */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-700" />
                    Visit Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 border border-gray-300 p-3">
                      <p className="text-xs text-gray-600 mb-1">First Visit</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedVisitor.first_visit_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 p-3">
                      <p className="text-xs text-gray-600 mb-1">Last Visit</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedVisitor.last_visit_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

