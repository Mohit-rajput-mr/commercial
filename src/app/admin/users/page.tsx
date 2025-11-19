'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Edit, Ban, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  initializeMockData,
} from '@/lib/admin-storage';
import type { AdminUser } from '@/types/admin';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    initializeMockData();
    const allUsers = getAdminUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, statusFilter, users]);

  const handleStatusChange = (userId: string, newStatus: AdminUser['status']) => {
    updateAdminUser(userId, { status: newStatus });
    setUsers(getAdminUsers());
  };

  const handleDelete = (user: AdminUser) => {
    deleteAdminUser(user.id);
    setUsers(getAdminUsers());
    setDeletingUser(null);
  };

  const getStatusBadgeColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mb-4"></div>
          <p className="text-custom-gray">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-black">User Management</h2>
        <p className="text-custom-gray mt-1">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">User ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Registered</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Inquiries</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray font-mono">{user.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary-black">{user.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-primary-black">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray">{user.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray">
                      {new Date(user.registeredDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray">
                      {new Date(user.lastLogin).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-primary-black">{user.totalInquiries}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      {user.status === 'Active' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'Blocked')}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Block User"
                        >
                          <Ban size={18} className="text-red-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'Active')}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Unblock User"
                        >
                          <UserCheck size={18} className="text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewingUser(null)} />
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative z-10">
            <h3 className="text-2xl font-bold text-primary-black mb-4">User Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-custom-gray">Name</label>
                <p className="text-primary-black">{viewingUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Email</label>
                <p className="text-primary-black">{viewingUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Phone</label>
                <p className="text-primary-black">{viewingUser.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Status</label>
                <p className="text-primary-black">{viewingUser.status}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Registered</label>
                <p className="text-primary-black">
                  {new Date(viewingUser.registeredDate).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Last Login</label>
                <p className="text-primary-black">{new Date(viewingUser.lastLogin).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-custom-gray">Total Inquiries</label>
                <p className="text-primary-black">{viewingUser.totalInquiries}</p>
              </div>
            </div>
            <button
              onClick={() => setViewingUser(null)}
              className="mt-6 w-full px-4 py-2 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeletingUser(null)} />
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative z-10">
            <h3 className="text-xl font-bold text-primary-black mb-2">Delete User</h3>
            <p className="text-custom-gray mb-6">
              Are you sure you want to delete user{' '}
              <span className="font-semibold text-primary-black">{deletingUser.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingUser)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


