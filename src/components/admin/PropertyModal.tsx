'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { AdminProperty } from '@/types/admin';
import {
  getAdminProperties,
  addAdminProperty,
  updateAdminProperty,
  addAdminActivity,
} from '@/lib/admin-storage';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: AdminProperty | null;
  onSave: () => void;
}

export default function PropertyModal({ isOpen, onClose, property, onSave }: PropertyModalProps) {
  const [formData, setFormData] = useState<Partial<AdminProperty>>({
    address: '',
    city: '',
    state: '',
    zip: '',
    price: 'Price on Request',
    status: 'For Lease',
    type: 'Office',
    beds: undefined,
    baths: undefined,
    sqft: undefined,
    yearBuilt: undefined,
    description: '',
    features: [],
    images: [],
    contactName: 'Leo Jo',
    contactEmail: 'leojoemail@gmail.com',
    contactPhone: '+1 (917) 209-6200',
    listedDate: new Date().toISOString(),
    views: 0,
    inquiries: 0,
  });
  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setFormData(property);
    } else {
      // Reset form for new property
      setFormData({
        address: '',
        city: '',
        state: '',
        zip: '',
        price: 'Price on Request',
        status: 'For Lease',
        type: 'Office',
        beds: undefined,
        baths: undefined,
        sqft: undefined,
        yearBuilt: undefined,
        description: '',
        features: [],
        images: [],
        contactName: 'Leo Jo',
        contactEmail: 'leojoemail@gmail.com',
        contactPhone: '+1 (917) 209-6200',
        listedDate: new Date().toISOString(),
        views: 0,
        inquiries: 0,
      });
    }
    setErrors({});
  }, [property, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'ZIP code is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.type) newErrors.type = 'Property type is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const propertyData: AdminProperty = {
      id: property?.id || `prop-${Date.now()}`,
      zpid: formData.zpid || `zpid-${Date.now()}`,
      address: formData.address!,
      city: formData.city!,
      state: formData.state!,
      zip: formData.zip!,
      price: formData.price || 'Price on Request',
      status: formData.status!,
      type: formData.type!,
      beds: formData.beds,
      baths: formData.baths,
      sqft: formData.sqft,
      yearBuilt: formData.yearBuilt,
      description: formData.description || '',
      features: formData.features || [],
      images: formData.images || [],
      contactName: formData.contactName || 'Leo Jo',
      contactEmail: formData.contactEmail || 'leojoemail@gmail.com',
      contactPhone: formData.contactPhone || '+1 (917) 209-6200',
      listedDate: formData.listedDate || new Date().toISOString(),
      views: formData.views || 0,
      inquiries: formData.inquiries || 0,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    if (property) {
      updateAdminProperty(property.id, propertyData);
      addAdminActivity({
        id: `act-${Date.now()}`,
        type: 'property_updated',
        description: `Property updated: ${propertyData.address}, ${propertyData.city}, ${propertyData.state}`,
        timestamp: new Date().toISOString(),
        propertyId: propertyData.id,
      });
    } else {
      addAdminProperty(propertyData);
      addAdminActivity({
        id: `act-${Date.now()}`,
        type: 'property_added',
        description: `New property added: ${propertyData.address}, ${propertyData.city}, ${propertyData.state}`,
        timestamp: new Date().toISOString(),
        propertyId: propertyData.id,
      });
    }

    onSave();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const features = [...(formData.features || [])];
    features.splice(index, 1);
    setFormData({ ...formData, features });
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), url],
      });
    }
  };

  const removeImage = (index: number) => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);
    setFormData({ ...formData, images });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-primary-black">
                {property ? 'Edit Property' : 'Add New Property'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.address ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.city ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.state ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zip || ''}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.zip ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      />
                      {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        ZPID
                      </label>
                      <input
                        type="text"
                        value={formData.zpid || ''}
                        onChange={(e) => setFormData({ ...formData, zpid: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                        placeholder="Zillow Property ID"
                      />
                    </div>
                  </div>
                </section>

                {/* Listing Details */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Listing Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Status *
                      </label>
                      <select
                        value={formData.status || 'For Lease'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminProperty['status'] })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.status ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      >
                        <option value="For Lease">For Lease</option>
                        <option value="For Sale">For Sale</option>
                        <option value="Auctions">Auctions</option>
                        <option value="Businesses For Sale">Businesses For Sale</option>
                        <option value="LandForAuction">LandForAuction</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Property Type *
                      </label>
                      <select
                        value={formData.type || 'Office'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AdminProperty['type'] })}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                          errors.type ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                        }`}
                      >
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
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Price
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={typeof formData.price === 'number' ? formData.price : ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: e.target.value ? parseFloat(e.target.value) : 'Price on Request',
                            })
                          }
                          placeholder="Enter price"
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              price: formData.price === 'Price on Request' ? 0 : 'Price on Request',
                            })
                          }
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            formData.price === 'Price on Request'
                              ? 'bg-accent-yellow text-primary-black'
                              : 'bg-gray-200 text-primary-black hover:bg-gray-300'
                          }`}
                        >
                          Price on Request
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.yearBuilt || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearBuilt: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Listed Date
                      </label>
                      <input
                        type="date"
                        value={formData.listedDate ? new Date(formData.listedDate).toISOString().split('T')[0] : ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            listedDate: new Date(e.target.value).toISOString(),
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>
                  </div>
                </section>

                {/* Property Specs */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Property Specs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={formData.beds || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beds: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        value={formData.baths || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baths: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Square Feet
                      </label>
                      <input
                        type="number"
                        value={formData.sqft || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sqft: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Description</h3>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    placeholder="About this property..."
                  />
                </section>

                {/* Features */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Key Features</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="Add feature"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.features || []).map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-primary-black rounded-lg text-sm flex items-center gap-2"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>

                {/* Contact Information */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Agent/Broker Name
                      </label>
                      <input
                        type="text"
                        value={formData.contactName || ''}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail || ''}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone || ''}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      />
                    </div>
                  </div>
                </section>

                {/* Images */}
                <section>
                  <h3 className="text-lg font-bold text-primary-black mb-4">Images</h3>
                  <button
                    type="button"
                    onClick={addImage}
                    className="mb-4 px-4 py-2 bg-gray-100 text-primary-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Image URL
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(formData.images || []).map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`Property ${index + 1}`}
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
                >
                  Save Property
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}


