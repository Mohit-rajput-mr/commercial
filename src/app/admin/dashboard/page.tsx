'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Key,
  DollarSign,
  Gavel,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#FFD700', '#4299E1', '#48BB78', '#F56565', '#9F7AEA', '#ED8936'];

interface DashboardStats {
  totalProperties: number;
  forLease: number;
  forSale: number;
  auctions: number;
  totalUsers: number;
}

interface PropertyType {
  type: string;
  count: number;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    forLease: 0,
    forSale: 0,
    auctions: 0,
    totalUsers: 0,
  });
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data from API
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setPropertyTypes(data.propertyTypes || []);
        setActivities(data.recentActivities || []);
        
        // Convert viewsByDay object to array for chart
        const viewsArray = Object.entries(data.viewsByDay || {}).map(([day, views]) => ({
          day,
          views,
        }));
        setViewsData(viewsArray);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Properties by status (pie chart)
  const statusData = [
    { name: 'For Lease', value: stats.forLease },
    { name: 'For Sale', value: stats.forSale },
    { name: 'Auctions', value: stats.auctions },
  ].filter(item => item.value > 0); // Only show non-zero values

  const statCards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'For Lease',
      value: stats.forLease,
      icon: Key,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'For Sale',
      value: stats.forSale,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Auctions',
      value: stats.auctions,
      icon: Gavel,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mx-auto mb-4"></div>
          <p className="text-custom-gray">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-accent-yellow rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary-black mb-1">{stat.value}</div>
              <div className="text-sm text-custom-gray">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by Status - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-bold text-primary-black mb-4">Properties by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Property Views - Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-bold text-primary-black mb-4">Property Views (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#FFD700" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-primary-black mb-4">Properties by Type</h3>
        {propertyTypes.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-custom-gray">No property data available</p>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-primary-black mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 bg-accent-yellow rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-primary-black">{activity.description}</p>
                  <p className="text-xs text-custom-gray mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-custom-gray">No recent activities</p>
              <p className="text-xs text-custom-gray mt-2">Activities will appear here as you use the platform</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


