'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Globe, Mail as MailIcon } from 'lucide-react';
import {
  getAdminSettings,
  saveAdminSettings,
  getAdminProfile,
  saveAdminProfile,
  addAdminActivity,
} from '@/lib/admin-storage';
import type { AdminSettings, AdminProfile } from '@/types/admin';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'site' | 'profile' | 'email' | 'general'>('site');
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [profile, setProfile] = useState<AdminProfile>(getAdminProfile());
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSettings(getAdminSettings());
      setProfile(getAdminProfile());
    }
  }, []);

  const handleSaveSettings = () => {
    setSaving(true);
    saveAdminSettings(settings);
    addAdminActivity({
      id: `act-${Date.now()}`,
      type: 'settings_updated',
      description: 'Admin updated site settings',
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleSaveProfile = () => {
    setSaving(true);
    saveAdminProfile(profile);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleChangePassword = () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (password.new.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    // In a real app, this would call an API
    alert('Password changed successfully (demo mode)');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const tabs = [
    { id: 'site', label: 'Site Settings', icon: Globe },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'email', label: 'Email Templates', icon: MailIcon },
    { id: 'general', label: 'General', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-black">Settings</h2>
        <p className="text-custom-gray mt-1">Manage your site configuration and admin profile</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-accent-yellow border-b-2 border-accent-yellow'
                    : 'text-custom-gray hover:text-primary-black'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Site Settings Tab */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary-black">Site Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-full h-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={settings.officeAddress}
                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          )}

          {/* Admin Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary-black">Admin Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-bold text-primary-black mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-black mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Update Profile'}
              </button>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary-black">Email Templates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Inquiry Confirmation Email
                  </label>
                  <textarea
                    rows={6}
                    defaultValue="Thank you for your inquiry about {property_address}. We will get back to you shortly."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Property Viewing Confirmation
                  </label>
                  <textarea
                    rows={6}
                    defaultValue="Your viewing for {property_address} has been scheduled for {date} at {time}."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Chat Initiated Notification
                  </label>
                  <textarea
                    rows={6}
                    defaultValue="A new chat has been initiated for {property_address}. Please respond to the user's inquiry."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>
              </div>
              <button className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2">
                <Save size={20} />
                Save Templates
              </button>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary-black">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Properties Per Page
                  </label>
                  <input
                    type="number"
                    value={settings.propertiesPerPage}
                    onChange={(e) =>
                      setSettings({ ...settings, propertiesPerPage: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Default Sort Order
                  </label>
                  <select
                    value={settings.defaultSortOrder}
                    onChange={(e) => setSettings({ ...settings, defaultSortOrder: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-primary-black">Features</label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.enableUserRegistration}
                      onChange={(e) =>
                        setSettings({ ...settings, enableUserRegistration: e.target.checked })
                      }
                      className="w-5 h-5 text-accent-yellow rounded focus:ring-accent-yellow"
                    />
                    <span>Enable User Registration</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.enableLiveChat}
                      onChange={(e) =>
                        setSettings({ ...settings, enableLiveChat: e.target.checked })
                      }
                      className="w-5 h-5 text-accent-yellow rounded focus:ring-accent-yellow"
                    />
                    <span>Enable Live Chat</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.enableEmailNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, enableEmailNotifications: e.target.checked })
                      }
                      className="w-5 h-5 text-accent-yellow rounded focus:ring-accent-yellow"
                    />
                    <span>Enable Email Notifications</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        setSettings({ ...settings, maintenanceMode: e.target.checked })
                      }
                      className="w-5 h-5 text-accent-yellow rounded focus:ring-accent-yellow"
                    />
                    <span>Maintenance Mode</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

