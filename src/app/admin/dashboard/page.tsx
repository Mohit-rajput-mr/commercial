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
  MessageSquare,
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
import {
  getAdminProperties,
  getAdminUsers,
  getAdminChats,
  getAdminActivities,
  initializeMockData,
} from '@/lib/admin-storage';
import type { AdminProperty, Activity } from '@/types/admin';

const COLORS = ['#FFD700', '#4299E1', '#48BB78', '#F56565', '#9F7AEA', '#ED8936'];

export default function AdminDashboard() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();

    // Load data
    setProperties(getAdminProperties());
    setUsers(getAdminUsers());
    setChats(getAdminChats());
    setActivities(getAdminActivities());
    setLoading(false);
  }, []);

  // Calculate stats
  const stats = {
    totalProperties: properties.length,
    forLease: properties.filter(p => p.status === 'For Lease').length,
    forSale: properties.filter(p => p.status === 'For Sale').length,
    auctions: properties.filter(p => p.status === 'Auctions' || p.status === 'LandForAuction').length,
    totalUsers: users.length,
    pendingChats: chats.filter(c => c.status === 'Active' && c.unreadCount > 0).length,
  };

  // Properties by status (pie chart)
  const statusData = [
    { name: 'For Lease', value: stats.forLease },
    { name: 'For Sale', value: stats.forSale },
    { name: 'Auctions', value: stats.auctions },
  ];

  // Property views (last 7 days) - mock data
  const viewsData = [
    { day: 'Mon', views: 245 },
    { day: 'Tue', views: 312 },
    { day: 'Wed', views: 289 },
    { day: 'Thu', views: 356 },
    { day: 'Fri', views: 298 },
    { day: 'Sat', views: 234 },
    { day: 'Sun', views: 267 },
  ];

  // Properties by type (bar chart)
  const typeData = [
    { type: 'Office', count: properties.filter(p => p.type === 'Office').length },
    { type: 'Retail', count: properties.filter(p => p.type === 'Retail').length },
    { type: 'Industrial', count: properties.filter(p => p.type === 'Industrial').length },
    { type: 'Flex', count: properties.filter(p => p.type === 'Flex').length },
    { type: 'Coworking', count: properties.filter(p => p.type === 'Coworking').length },
    { type: 'Medical', count: properties.filter(p => p.type === 'Medical').length },
  ];

  const statCards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
    },
    {
      label: 'For Lease',
      value: stats.forLease,
      icon: Key,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%',
    },
    {
      label: 'For Sale',
      value: stats.forSale,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+5%',
    },
    {
      label: 'Auctions',
      value: stats.auctions,
      icon: Gavel,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '+3%',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: '+15%',
    },
    {
      label: 'Pending Chats',
      value: stats.pendingChats,
      icon: MessageSquare,
      color: 'text-accent-yellow',
      bgColor: 'bg-yellow-50',
      trend: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mb-4"></div>
          <p className="text-custom-gray">Loading dashboard...</p>
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
                {stat.trend && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp size={16} />
                    <span className="font-semibold">{stat.trend}</span>
                  </div>
                )}
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#FFD700" />
          </BarChart>
        </ResponsiveContainer>
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
          {activities.slice(0, 10).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-2 h-2 bg-accent-yellow rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-primary-black">{activity.description}</p>
                <p className="text-xs text-custom-gray mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}


