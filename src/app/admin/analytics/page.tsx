'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { Loader2, Globe, MapPin, Smartphone, Monitor, Tablet, Calendar, Filter } from 'lucide-react';

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
}

interface AnalyticsStats {
  totalVisitors: number;
  uniqueVisitors: number;
  topCountries: Array<{ country: string; count: number; code: string }>;
  topCities: Array<{ city: string; count: number }>;
  deviceCounts: Record<string, number>;
  browserCounts: Array<{ browser: string; count: number }>;
  osCounts: Array<{ os: string; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
}

const COLORS = ['#ffd700', '#ffed4e', '#ffc107', '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5'];

// Custom label renderer for Pie charts with dark, visible text
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  if (!percent || percent < 0.05) return null; // Don't show labels for very small slices
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#111827" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={14}
      fontWeight={700}
      style={{ 
        textShadow: '0 0 4px rgba(255,255,255,1), 0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 100
      }}
    >
      {`${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
    </text>
  );
};

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsResponse = await fetch(`/api/admin/analytics/stats?period=${period}`);
      
      if (!statsResponse.ok) {
        throw new Error(`Stats API error: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      console.log('Stats API response:', statsData);

      if (statsData.success && statsData.stats) {
        console.log('Setting stats:', statsData.stats);
        setStats(statsData.stats);
      } else {
        console.warn('Stats API returned unsuccessful or no data:', statsData);
        setError(statsData.error || 'Failed to load analytics stats');
        // Set empty stats to prevent crashes
        setStats({
          totalVisitors: 0,
          uniqueVisitors: 0,
          topCountries: [],
          topCities: [],
          deviceCounts: {},
          browserCounts: [],
          osCounts: [],
          timeSeries: [],
        });
      }

      // Load visitors list
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        period,
      });
      if (deviceFilter !== 'all') params.append('deviceType', deviceFilter);
      if (countryFilter !== 'all') params.append('country', countryFilter);

      const visitorsResponse = await fetch(`/api/admin/analytics/visitors?${params.toString()}`);
      
      if (!visitorsResponse.ok) {
        throw new Error(`Visitors API error: ${visitorsResponse.status}`);
      }
      
      const visitorsData = await visitorsResponse.json();
      console.log('Visitors API response:', visitorsData);

      if (visitorsData.success) {
        setVisitors(visitorsData.visitors || []);
        setTotalPages(visitorsData.pagination?.totalPages || 1);
      } else {
        console.warn('Visitors API returned unsuccessful:', visitorsData);
        setVisitors([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      // Set empty stats to prevent crashes
      setStats({
        totalVisitors: 0,
        uniqueVisitors: 0,
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
  }, [period, deviceFilter, countryFilter, page]);

  // Format device counts for pie chart
  const deviceChartData = stats?.deviceCounts ? Object.entries(stats.deviceCounts).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
  })) : [];

  // Format browser data for bar chart
  const browserChartData = stats?.browserCounts || [];

  // Format OS data for bar chart
  const osChartData = stats?.osCounts || [];

  // Get unique countries for filter
  const uniqueCountries = stats && stats.topCountries ? stats.topCountries.map((c) => c.country) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-black">Visitor Analytics</h1>
          <p className="text-gray-500 mt-1">Track and analyze website visitors</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-gray-500" />
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={18} className="text-gray-500" />
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading analytics:</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check the browser console for more details.</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Visitors</p>
                <p className="text-3xl font-bold text-primary-black">{stats.totalVisitors.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Globe className="w-6 h-6 text-accent-yellow" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Unique Visitors</p>
                <p className="text-3xl font-bold text-primary-black">{stats.uniqueVisitors.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Top Country</p>
                <p className="text-xl font-bold text-primary-black">
                  {stats.topCountries[0]?.country || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.topCountries[0]?.count || 0} visitors
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1: Visitors Over Time & Device Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Over Time */}
        {stats && stats.timeSeries.length > 0 ? (
          <div className="p-6 rounded-lg relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Visitors Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.timeSeries} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} 
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#111827', paddingTop: '20px', fontWeight: 600, fontSize: '14px', zIndex: 10 }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ffd700" 
                  strokeWidth={3}
                  name="Visitors"
                  dot={{ fill: '#ffd700', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {stats.timeSeries.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Daily Breakdown</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Visitors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.timeSeries.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.date}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.count} visitors</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-lg relative z-10 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-black mb-4">Visitors Over Time</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No visitor data available for the selected period</p>
            </div>
          </div>
        )}

        {/* Device Types */}
        {deviceChartData.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Device Types</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart style={{ background: 'transparent' }}>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {deviceChartData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Device Breakdown</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Device Type</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deviceChartData.map((item, idx) => {
                        const total = deviceChartData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded" 
                                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.value}</td>
                            <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Device Types</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No device data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 2: Top Countries & Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        {stats && stats.topCountries.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Top Countries</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCountries.slice(0, 10)} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="country" 
                  tick={{ fontSize: 12, fill: '#111827', fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} 
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
                <Bar dataKey="count" fill="#ffd700" name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {stats.topCountries.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Top Countries</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Country</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Visitors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.topCountries.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.country}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.count} visitors</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Top Countries</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No country data available</p>
            </div>
          </div>
        )}

        {/* Top Cities */}
        {stats && stats.topCities.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Top Cities</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCities.slice(0, 10)} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="city" 
                  tick={{ fontSize: 12, fill: '#111827', fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} 
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
                <Bar dataKey="count" fill="#ffc107" name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {stats.topCities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Top Cities</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Visitors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.topCities.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.city}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.count} visitors</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Top Cities</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No city data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 3: Browsers & Operating Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browsers */}
        {browserChartData.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Browsers</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserChartData} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="browser" 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }}
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} 
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
                <Bar dataKey="count" fill="#673ab7" name="Users" />
              </BarChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {browserChartData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Browser Breakdown</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Browser</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {browserChartData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.browser}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.count} users</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Browsers</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No browser data available</p>
            </div>
          </div>
        )}

        {/* Operating Systems */}
        {osChartData.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Operating Systems</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={osChartData} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="os" 
                  tick={{ fontSize: 12, fill: '#111827', fontWeight: 600 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} 
                  stroke="#111827"
                  strokeWidth={1.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #1f2937',
                    color: '#1f2937',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
                  itemStyle={{ color: '#1f2937', fontWeight: '600', fontSize: '13px' }}
                />
                <Bar dataKey="count" fill="#3f51b5" name="Users" />
              </BarChart>
            </ResponsiveContainer>
            {/* Complete Data Table */}
            {osChartData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary-black mb-4">Operating Systems Breakdown</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Operating System</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {osChartData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.os}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-black text-right">{item.count} users</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative z-10">
            <h2 className="text-xl font-bold text-primary-black mb-4">Operating Systems</h2>
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No OS data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary-black">Recent Visitors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Browser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No visitors found
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.country || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {visitor.device_type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.browser || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.visit_count || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(visitor.last_visit_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

