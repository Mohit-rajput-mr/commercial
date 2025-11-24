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
  Upload,
  FileJson,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import AddPropertyModal from '@/components/admin/AddPropertyModal';

interface Property {
  id: string;
  zpid: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number | null;
  price_text: string | null;
  status: string;
  property_type: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  images: any;
  views: number;
  inquiries: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'uploading' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const itemsPerPage = 20;

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/properties?limit=1000', {
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      }); // Get all properties (including inactive)
      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
        setFilteredProperties(data.properties || []);
      } else {
        console.error('Failed to load properties:', data.error);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...properties];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.state.toLowerCase().includes(query) ||
          p.zpid.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((p) => p.property_type === typeFilter);
    }

    if (priceMin) {
      filtered = filtered.filter((p) => (p.price || 0) >= parseFloat(priceMin));
    }

    if (priceMax) {
      filtered = filtered.filter((p) => (p.price || 0) <= parseFloat(priceMax));
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, priceMin, priceMax, properties]);

  const handleDelete = async (property: Property) => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      });

      if (response.ok) {
        loadProperties();
        setDeletingProperty(null);
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProperties.size} properties?`)) return;

    for (const id of selectedProperties) {
      try {
        await fetch(`/api/properties/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-admin-token': 'admin-authenticated'
          }
        });
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }

    setSelectedProperties(new Set());
    loadProperties();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: 'uploading', message: 'Reading file...' });

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      setUploadStatus({ type: 'uploading', message: 'Uploading properties...' });

      const response = await fetch('/api/properties/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: Array.isArray(jsonData) ? jsonData : [jsonData] }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus({ type: 'success', message: `Successfully uploaded ${data.count} properties!` });
        loadProperties();
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadStatus({ type: 'idle' });
        }, 2000);
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'error', message: 'Invalid JSON file or upload failed' });
    }
  };

  const togglePropertySelection = (id: string) => {
    const newSelection = new Set(selectedProperties);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProperties(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProperties.size === paginatedProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(paginatedProperties.map((p) => p.id)));
    }
  };

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mx-auto mb-4"></div>
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
          <h1 className="text-2xl font-bold text-primary-black">Properties Management</h1>
          <p className="text-custom-gray mt-1">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadProperties}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            title="Refresh properties list"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus size={18} />
            Add Property
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload size={18} />
            Upload JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={18} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
          >
            <option value="All">All Status</option>
            <option value="For Lease">For Lease</option>
            <option value="For Sale">For Sale</option>
            <option value="Auctions">Auctions</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
          >
            <option value="All">All Types</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
            <option value="Industrial">Industrial</option>
            <option value="Flex">Flex</option>
            <option value="Coworking">Coworking</option>
            <option value="Medical">Medical</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.size > 0 && (
        <div className="bg-accent-yellow/20 border border-accent-yellow rounded-lg p-4 flex items-center justify-between">
          <span className="font-semibold text-primary-black">
            {selectedProperties.size} {selectedProperties.size === 1 ? 'property' : 'properties'} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="hover:opacity-70">
                    {selectedProperties.size === paginatedProperties.length && paginatedProperties.length > 0 ? (
                      <CheckSquare size={20} className="text-accent-yellow" />
                    ) : (
                      <Square size={20} className="text-custom-gray" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Property</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Views</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-custom-gray">
                    {properties.length === 0 ? 'No properties yet. Upload a JSON file to get started.' : 'No properties match your filters'}
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => togglePropertySelection(property.id)}>
                        {selectedProperties.has(property.id) ? (
                          <CheckSquare size={20} className="text-accent-yellow" />
                        ) : (
                          <Square size={20} className="text-custom-gray" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {property.images && property.images[0] && (
                            <Image
                              src={property.images[0]}
                              alt={property.address}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary-black">{property.address}</span>
                            {property.is_active ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-custom-gray">
                            {property.city}, {property.state} {property.zip}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'For Lease' ? 'bg-green-100 text-green-800' :
                        property.status === 'For Sale' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-custom-gray">{property.property_type}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-black">
                      {property.price ? `$${property.price.toLocaleString()}` : property.price_text || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-custom-gray">{property.views || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} className="text-custom-gray" />
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-custom-gray">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadProperties}
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-black">Upload Properties JSON</h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileJson size={48} className="mx-auto text-custom-gray mb-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-upload"
                    disabled={uploadStatus.type === 'uploading'}
                  />
                  <label
                    htmlFor="json-upload"
                    className="cursor-pointer text-accent-yellow hover:underline font-semibold"
                  >
                    Choose JSON file
                  </label>
                  <p className="text-sm text-custom-gray mt-2">
                    Upload commercial_dataset2.json or similar
                  </p>
                </div>

                {uploadStatus.type !== 'idle' && (
                  <div className={`p-4 rounded-lg ${
                    uploadStatus.type === 'uploading' ? 'bg-blue-50 text-blue-800' :
                    uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                    'bg-red-50 text-red-800'
                  }`}>
                    {uploadStatus.message}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-primary-black mb-4">Confirm Delete</h3>
              <p className="text-custom-gray mb-6">
                Are you sure you want to delete <strong>{deletingProperty.address}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingProperty(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingProperty)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
