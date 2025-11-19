'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import Image from 'next/image';
import {
  getAdminProperties,
  deleteAdminProperty,
  addAdminActivity,
  initializeMockData,
} from '@/lib/admin-storage';
import type { AdminProperty } from '@/types/admin';
import PropertyModal from '@/components/admin/PropertyModal';

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<AdminProperty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    initializeMockData();
    const props = getAdminProperties();
    setProperties(props);
    setFilteredProperties(props);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.zpid.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          `${p.city}, ${p.state}`.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Price filter
    if (priceMin) {
      const min = parseFloat(priceMin);
      filtered = filtered.filter((p) => {
        if (typeof p.price === 'number') return p.price >= min;
        return false;
      });
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      filtered = filtered.filter((p) => {
        if (typeof p.price === 'number') return p.price <= max;
        return false;
      });
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, priceMin, priceMax, properties]);

  const handleDelete = (property: AdminProperty) => {
    deleteAdminProperty(property.id);
    setProperties(getAdminProperties());
    addAdminActivity({
      id: `act-${Date.now()}`,
      type: 'property_deleted',
      description: `Property deleted: ${property.address}, ${property.city}, ${property.state}`,
      timestamp: new Date().toISOString(),
      propertyId: property.id,
    });
    setDeletingProperty(null);
  };

  const handleBulkDelete = () => {
    selectedProperties.forEach((id) => {
      const prop = properties.find((p) => p.id === id);
      if (prop) {
        deleteAdminProperty(id);
        addAdminActivity({
          id: `act-${Date.now()}-${id}`,
          type: 'property_deleted',
          description: `Property deleted: ${prop.address}, ${prop.city}, ${prop.state}`,
          timestamp: new Date().toISOString(),
          propertyId: id,
        });
      }
    });
    setProperties(getAdminProperties());
    setSelectedProperties(new Set());
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === paginatedProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(paginatedProperties.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProperties(newSelected);
  };

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const getStatusBadgeColor = (status: AdminProperty['status']) => {
    switch (status) {
      case 'For Lease':
        return 'bg-blue-100 text-blue-800';
      case 'For Sale':
        return 'bg-green-100 text-green-800';
      case 'LandForAuction':
        return 'bg-red-100 text-red-800';
      case 'Auctions':
        return 'bg-red-100 text-red-800';
      case 'Businesses For Sale':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mb-4"></div>
          <p className="text-custom-gray">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-black">Properties Management</h2>
          <p className="text-custom-gray mt-1">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          className="bg-accent-yellow text-primary-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Property
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={20} />
              <input
                type="text"
                placeholder="Search by address, ZPID, or property ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
          >
            <option value="All">All Status</option>
            <option value="For Lease">For Lease</option>
            <option value="For Sale">For Sale</option>
            <option value="Auctions">Auctions</option>
            <option value="Businesses For Sale">Businesses For Sale</option>
            <option value="LandForAuction">LandForAuction</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
          >
            <option value="All">All Types</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
            <option value="Industrial">Industrial</option>
            <option value="Flex">Flex</option>
            <option value="Coworking">Coworking</option>
            <option value="Medical">Medical</option>
            <option value="Land">Land</option>
            <option value="Condo">Condo</option>
            <option value="House">House</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow text-sm"
            />
            <input
              type="number"
              placeholder="Max $"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow text-sm"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProperties.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-custom-gray">
              {selectedProperties.size} {selectedProperties.size === 1 ? 'property' : 'properties'} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center"
                  >
                    {selectedProperties.size === paginatedProperties.length && paginatedProperties.length > 0 ? (
                      <CheckSquare size={20} className="text-accent-yellow" />
                    ) : (
                      <Square size={20} className="text-custom-gray" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Address & Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">ZPID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Listed</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProperties.map((property) => (
                <motion.tr
                  key={property.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(property.id)}>
                      {selectedProperties.has(property.id) ? (
                        <CheckSquare size={20} className="text-accent-yellow" />
                      ) : (
                        <Square size={20} className="text-custom-gray" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {property.images?.[0] ? (
                        <Image
                          src={property.images[0]}
                          alt={property.address}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary-black">{property.address}</div>
                    <div className="text-sm text-custom-gray flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {property.city}, {property.state} {property.zip}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray font-mono">{property.zpid}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary-black">
                      {typeof property.price === 'number' ? (
                        `$${property.price.toLocaleString()}`
                      ) : (
                        property.price
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(property.status)}`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-primary-black">{property.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray">
                      {property.beds && `${property.beds} bed`}
                      {property.beds && property.baths && ' • '}
                      {property.baths && `${property.baths} bath`}
                      {property.sqft && ` • ${property.sqft.toLocaleString()} sqft`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-custom-gray flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(property.listedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // View property - navigate to property detail page
                          window.open(`/property/commercial/${property.id}`, '_blank');
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProperty(property);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-accent-yellow" />
                      </button>
                      <button
                        onClick={() => setDeletingProperty(property)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-custom-gray">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of{' '}
              {filteredProperties.length} properties
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Modal */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={() => {
          setProperties(getAdminProperties());
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProperty && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProperty(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-primary-black mb-2">Delete Property</h3>
                <p className="text-custom-gray mb-6">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-primary-black">
                    {deletingProperty.address}, {deletingProperty.city}, {deletingProperty.state}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingProperty(null)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deletingProperty)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


