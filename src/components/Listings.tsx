'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { allProperties } from '@/data/sampleProperties';
import type { Property } from '@/types/property';

export default function Listings() {
  const [activeTab, setActiveTab] = useState<'For Lease' | 'For Sale' | 'Auctions'>('For Lease');
  const [listings] = useState<Property[]>(allProperties.slice(0, 8));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);


  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  return (
    <div className="py-20 px-5 bg-light-gray">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-black mb-6">
              Trending Properties
            </h2>
            <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
              {(['For Lease', 'For Sale', 'Auctions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg border-2 font-semibold text-sm md:text-base transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-primary-black text-accent-yellow border-primary-black'
                      : 'bg-transparent text-primary-black border-primary-black hover:bg-primary-black hover:text-accent-yellow'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <a
            href="#"
            className="text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors flex items-center gap-2"
          >
            See More <ArrowRight size={20} />
          </a>
        </div>

        {/* Listings Grid */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 touch-pan-x"
        >
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 min-w-max md:min-w-0">
            {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all relative group flex-shrink-0 w-[calc(50vw-1.5rem)] md:w-auto cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                // Do nothing for now
              }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${listing.imageUrl})` }}
                />
                
                {/* Tag */}
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-semibold text-primary-black">
                  {listing.type}
                </div>

                {/* Favorite Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(listing.id);
                  }}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                    favorites.has(listing.id)
                      ? 'bg-accent-yellow text-primary-black'
                      : 'bg-white text-primary-black hover:bg-accent-yellow'
                  }`}
                >
                  <Heart
                    size={20}
                    fill={favorites.has(listing.id) ? 'currentColor' : 'none'}
                  />
                </motion.button>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="text-2xl font-bold text-primary-black mb-2">
                  {listing.price}
                </div>
                <div className="text-base text-custom-gray mb-1">
                  {listing.address}
                </div>
                <div className="text-base text-custom-gray mb-3">
                  {listing.city}, {listing.state} {listing.zipCode}
                </div>
                <div className="text-sm font-semibold text-primary-black">
                  {listing.size}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

