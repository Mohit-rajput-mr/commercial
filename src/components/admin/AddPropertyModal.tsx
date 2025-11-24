'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Loader } from 'lucide-react';
import Image from 'next/image';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    zpid: `prop-${Date.now()}`,
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    price: '',
    price_text: '',
    status: 'For Lease',
    property_type: 'Commercial',
    beds: '',
    baths: '',
    sqft: '',
    living_area: '',
    lot_size: '',
    year_built: '',
    description: '',
    contact_name: 'Leo Jo',
    contact_email: 'leojoemail@gmail.com',
    contact_phone: '+1 (917) 209-6200',
    is_featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add files
    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Convert images to base64 for storage
      const imageDataUrls = await Promise.all(
        imageFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const propertyData = {
        ...formData,
        zpid: formData.zpid || `prop-${Date.now()}`,
        price: formData.price ? parseFloat(formData.price) : null,
        beds: formData.beds ? parseInt(formData.beds) : null,
        baths: formData.baths ? parseFloat(formData.baths) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        living_area: formData.living_area ? parseInt(formData.living_area) : null,
        lot_size: formData.lot_size ? parseInt(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        images: imageDataUrls, // Base64 encoded images
        features: [],
        source: 'manual',
        is_active: true,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Property added successfully!');
        onSuccess();
        onClose();
        resetForm();
      } else {
        alert(data.error || 'Failed to add property');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      zpid: `prop-${Date.now()}`,
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      price: '',
      price_text: '',
      status: 'For Lease',
      property_type: 'Commercial',
      beds: '',
      baths: '',
      sqft: '',
      living_area: '',
      lot_size: '',
      year_built: '',
      description: '',
      contact_name: 'Leo Jo',
      contact_email: 'leojoemail@gmail.com',
      contact_phone: '+1 (917) 209-6200',
      is_featured: false,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-primary-black">Add New Property</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        errors.city ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        errors.state ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        errors.zip ? 'border-red-500' : 'border-gray-300 focus:border-accent-yellow'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    >
                      <option value="For Lease">For Lease</option>
                      <option value="For Sale">For Sale</option>
                      <option value="Auctions">Auctions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Property Type *</label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      required
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="1000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Price Text</label>
                    <input
                      type="text"
                      name="price_text"
                      value={formData.price_text}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="$1,000,000 or Contact for Price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Bedrooms</label>
                    <input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      name="baths"
                      value={formData.baths}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Square Feet</label>
                    <input
                      type="number"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">Year Built</label>
                    <input
                      type="number"
                      name="year_built"
                      value={formData.year_built}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-primary-black mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  placeholder="Describe the property..."
                />
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-4">Property Images</h3>
                
                {/* Upload Images from Device */}
                <div className="mb-4">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent-yellow cursor-pointer transition-colors"
                  >
                    <Upload size={20} className="text-custom-gray" />
                    <span className="text-custom-gray">Click to upload images from your device</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-custom-gray mt-2">
                    Supports: JPG, PNG, WebP. You can select multiple images.
                  </p>
                </div>

                {/* Image Preview */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={preview}
                            alt={`Property image ${index + 1}`}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {imageFiles[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-accent-yellow rounded focus:ring-accent-yellow"
                />
                <label htmlFor="is_featured" className="text-sm font-semibold text-primary-black">
                  Mark as Featured Property
                </label>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-accent-yellow rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Property
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

