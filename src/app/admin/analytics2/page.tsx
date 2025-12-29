'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Globe, MapPin, Smartphone, Monitor, Tablet, Calendar, 
  TrendingUp, Activity, Eye, MousePointerClick, ChevronRight
} from 'lucide-react';

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

export default function Analytics2Page() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsResponse = await fetch(`/api/admin/analytics/stats?period=${period}`);
      
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
          topCountries: [],
          topCities: [],
          deviceCounts: {},
          browserCounts: [],
          osCounts: [],
          timeSeries: [],
        });
      }

      const visitorsResponse = await fetch(`/api/admin/analytics/visitors?page=1&limit=50&period=${period}`);
      
      if (!visitorsResponse.ok) {
        throw new Error(`Visitors API error: ${visitorsResponse.status}`);
      }
      
      const visitorsData = await visitorsResponse.json();

      if (visitorsData.success) {
        setVisitors(visitorsData.visitors || []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
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
  }, [period]);

  const deviceChartData = stats?.deviceCounts ? Object.entries(stats.deviceCounts).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalDevices = deviceChartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Comprehensive visitor insights and analytics</p>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg p-2 border border-gray-200">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value as any);
                }}
                className="px-4 py-2 bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">Error loading analytics:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Visitors</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Unique Visitors</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Top Country</h3>
              <p className="text-xl font-bold text-gray-900">{stats.topCountries[0]?.country || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.topCountries[0]?.count || 0} visitors</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <MousePointerClick className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Avg. Visits</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalVisitors > 0 ? (stats.totalVisitors / stats.uniqueVisitors).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        )}

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visitors Over Time List */}
          {stats && stats.timeSeries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Visitors Over Time</h2>
                </div>
              </div>
              <div className="space-y-2">
                {stats.timeSeries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">{item.date}</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device Types List */}
          {deviceChartData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Device Types</h2>
                </div>
              </div>
              <div className="space-y-2">
                {deviceChartData.map((item, idx) => {
                  const percentage = totalDevices > 0 ? ((item.value / totalDevices) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">({percentage}%)</span>
                        <span className="text-sm font-bold text-purple-600">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Countries and Cities Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Countries List */}
          {stats && stats.topCountries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Top Countries</h2>
                </div>
              </div>
              <div className="space-y-2">
                {stats.topCountries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}</span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{item.country}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Cities List */}
          {stats && stats.topCities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Top Cities</h2>
                </div>
              </div>
              <div className="space-y-2">
                {stats.topCities.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}</span>
                      <ChevronRight className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{item.city}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{item.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Browsers and OS Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Browsers List */}
          {stats && stats.browserCounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Monitor className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Browsers</h2>
                </div>
              </div>
              <div className="space-y-2">
                {stats.browserCounts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">{item.browser}</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{item.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operating Systems List */}
          {stats && stats.osCounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Tablet className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Operating Systems</h2>
                </div>
              </div>
              <div className="space-y-2">
                {stats.osCounts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">{item.os}</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">{item.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Visitors Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Visitors</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visits</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No visitors found
                    </td>
                  </tr>
                ) : (
                  visitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{visitor.ip_address}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {visitor.city && visitor.country ? `${visitor.city}, ${visitor.country}` : visitor.country || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">{visitor.device_type || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{visitor.browser || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{visitor.visit_count || 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(visitor.last_visit_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
