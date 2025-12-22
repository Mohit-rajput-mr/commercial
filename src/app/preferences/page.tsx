'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Check, X } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import { savePreferences, getPreferences } from '@/lib/userPreferencesDB';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    propertyTypes: [] as string[],
    priceRange: { min: '', max: '' },
    locations: [] as string[],
    notifications: {
      email: false,
      sms: false,
      newProperties: true,
      priceChanges: false,
    },
    searchFilters: {
      bedrooms: [] as number[],
      bathrooms: [] as number[],
    },
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await getPreferences();
        if (savedPrefs) {
          setPreferences({
            propertyTypes: savedPrefs.propertyTypes || [],
            priceRange: {
              min: savedPrefs.priceRange?.min?.toString() || '',
              max: savedPrefs.priceRange?.max?.toString() || '',
            },
            locations: savedPrefs.locations || [],
            notifications: {
              email: savedPrefs.notifications?.email ?? false,
              sms: savedPrefs.notifications?.sms ?? false,
              newProperties: savedPrefs.notifications?.newProperties ?? true,
              priceChanges: savedPrefs.notifications?.priceChanges ?? false,
            },
            searchFilters: {
              bedrooms: savedPrefs.searchFilters?.bedrooms ?? [],
              bathrooms: savedPrefs.searchFilters?.bathrooms ?? [],
            },
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      await savePreferences({
        propertyTypes: preferences.propertyTypes,
        priceRange: {
          min: preferences.priceRange.min ? Number(preferences.priceRange.min) : undefined,
          max: preferences.priceRange.max ? Number(preferences.priceRange.max) : undefined,
        },
        locations: preferences.locations,
        notifications: preferences.notifications,
        searchFilters: preferences.searchFilters,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const togglePropertyType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const toggleBedroom = (bed: number) => {
    setPreferences(prev => ({
      ...prev,
      searchFilters: {
        ...prev.searchFilters,
        bedrooms: prev.searchFilters.bedrooms.includes(bed)
          ? prev.searchFilters.bedrooms.filter(b => b !== bed)
          : [...prev.searchFilters.bedrooms, bed],
      },
    }));
  };

  const toggleBathroom = (bath: number) => {
    setPreferences(prev => ({
      ...prev,
      searchFilters: {
        ...prev.searchFilters,
        bathrooms: prev.searchFilters.bathrooms.includes(bath)
          ? prev.searchFilters.bathrooms.filter(b => b !== bath)
          : [...prev.searchFilters.bathrooms, bath],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent-yellow rounded-lg">
              <Settings className="w-8 h-8 text-primary-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black">
              My Preferences
            </h1>
          </div>

          {/* Success Message - Centered Modal */}
          {saved && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-green-500 flex items-center gap-4 pointer-events-auto max-w-sm mx-4 relative"
              >
                <button
                  onClick={() => setSaved(false)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close notification"
                >
                  <X size={18} className="text-gray-600" />
                </button>
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <p className="text-green-800 font-semibold text-lg pr-6">Preferences saved successfully!</p>
              </motion.div>
            </div>
          )}

          <div className="space-y-8">
            {/* Property Types */}
            <section>
              <h2 className="text-xl font-bold text-primary-black mb-4">Preferred Property Types</h2>
              <div className="flex flex-wrap gap-3">
                {['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Hospitality', 'Healthcare', 'Mixed Use', 'Residential'].map((type) => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      preferences.propertyTypes.includes(type)
                        ? 'bg-accent-yellow text-primary-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            {/* Price Range */}
            <section>
              <h2 className="text-xl font-bold text-primary-black mb-4">Price Range</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price ($)</label>
                  <input
                    type="number"
                    value={preferences.priceRange.min}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: e.target.value },
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($)</label>
                  <input
                    type="number"
                    value={preferences.priceRange.max}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: e.target.value },
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                    placeholder="No limit"
                  />
                </div>
              </div>
            </section>

            {/* Bedrooms & Bathrooms */}
            <section>
              <h2 className="text-xl font-bold text-primary-black mb-4">Residential Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((bed) => (
                      <button
                        key={bed}
                        onClick={() => toggleBedroom(bed)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          preferences.searchFilters.bedrooms.includes(bed)
                            ? 'bg-accent-yellow text-primary-black'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {bed}+ Bedrooms
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((bath) => (
                      <button
                        key={bath}
                        onClick={() => toggleBathroom(bath)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          preferences.searchFilters.bathrooms.includes(bath)
                            ? 'bg-accent-yellow text-primary-black'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {bath}+ Bathrooms
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-xl font-bold text-primary-black mb-4">Notifications</h2>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'sms', label: 'SMS Notifications' },
                  { key: 'newProperties', label: 'New Properties Alerts' },
                  { key: 'priceChanges', label: 'Price Change Alerts' },
                ].map((notif) => (
                  <label key={notif.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications[notif.key as keyof typeof preferences.notifications]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [notif.key]: e.target.checked,
                        },
                      }))}
                      className="w-5 h-5 text-accent-yellow rounded focus:ring-accent-yellow"
                    />
                    <span className="text-gray-700">{notif.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="w-full md:w-auto px-8 py-3 bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

