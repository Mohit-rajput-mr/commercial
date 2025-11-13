'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const footerSections = {
  'For Sale': [
    ['Office Buildings for Sale', 'Retail Buildings for Sale', 'Restaurants for Sale', 'Land for Sale', 'Multifamily Apartments for Sale'],
    ['Austin Land for Sale', 'California Land for Sale', 'Florida Land for Sale', 'New York Apartment Buildings for Sale', 'Texas Farms for Sale'],
    ['Texas Land for Sale', 'Apartment Buildings for Sale', 'Auto Shops for Sale', 'Car Washes for Sale', 'Churches for Sale'],
    ['Data Centers for Sale', 'Drive-through Restaurants for Sale', 'Flex Space for Sale', 'Gas Stations for Sale'],
  ],
  'For Lease': [
    ['Office Space for Lease', 'Retail Space for Lease', 'Industrial Space for Lease', 'Warehouse Space for Lease'],
    ['Commercial Kitchen for Lease', 'Medical Office for Lease', 'Restaurant Space for Lease', 'Flex Space for Lease'],
    ['NYC Office Space', 'LA Retail Space', 'Chicago Industrial Space', 'Miami Office Space'],
    ['Small Office Space', 'Executive Suites', 'Shared Office Space', 'Virtual Offices'],
  ],
  'Coworking': [
    ['Coworking NYC', 'Coworking LA', 'Coworking Chicago', 'Coworking Austin'],
    ['Flexible Workspace', 'Shared Offices', 'Hot Desks', 'Private Offices'],
    ['Meeting Rooms', 'Event Spaces', 'Virtual Offices', 'Day Passes'],
    ['Enterprise Solutions', 'Startup Spaces', 'Creative Studios', 'Tech Hubs'],
  ],
};

const tabs = ['For Sale', 'For Lease', 'Coworking', 'Auctions', 'Investment Tools & Guides', 'International'];

export default function FooterNavigation() {
  const [activeTab, setActiveTab] = useState<string>('For Sale');

  return (
    <div className="bg-white py-16 px-5 border-t border-gray-200">
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Section Title */}
        <motion.h4
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-primary-black mb-8"
        >
          {activeTab}
        </motion.h4>

        {/* Links Grid */}
        {footerSections[activeTab as keyof typeof footerSections] && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {footerSections[activeTab as keyof typeof footerSections].map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
                {column.map((link, linkIndex) => (
                  <motion.a
                    key={linkIndex}
                    href="#"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: linkIndex * 0.05 }}
                    className="block text-custom-gray hover:text-accent-yellow transition-colors text-sm"
                  >
                    {link}
                  </motion.a>
                ))}
                {colIndex === 3 && (
                  <a href="#" className="block text-accent-yellow font-semibold text-sm hover:underline">
                    View More →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab
                  ? 'bg-primary-black text-accent-yellow'
                  : 'bg-light-gray text-custom-gray hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

