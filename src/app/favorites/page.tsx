'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowLeft, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAllFavorites, removeFavorite, type FavoriteProperty } from '@/lib/indexedDB';
import BackToHomeButton from '@/components/BackToHomeButton';
import Image from 'next/image';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favs = await getAllFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite(propertyId);
      setFavorites(prev => prev.filter(fav => fav.propertyId !== propertyId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handlePropertyClick = (property: FavoriteProperty) => {
    if (property.rawData) {
      sessionStorage.setItem(`commercial_property_${property.propertyId}`, JSON.stringify(property.rawData));
      sessionStorage.setItem('commercial_source', 'favorites');
    }
    
    if (property.dataSource === 'commercial') {
      router.push(`/commercial-detail?id=${encodeURIComponent(property.propertyId)}`);
    } else {
      router.push(`/property/residential/${property.propertyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-accent-yellow rounded-lg">
              <Heart className="w-6 h-6 text-primary-black fill-current" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black">
              My Favorites
            </h1>
          </div>
          <p className="text-gray-600">
            {favorites.length === 0 
              ? 'No favorites yet. Start exploring properties and save your favorites!'
              : `You have ${favorites.length} favorite ${favorites.length === 1 ? 'property' : 'properties'}`
            }
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow" />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Favorites Yet</h2>
            <p className="text-gray-500 mb-6">Start exploring properties and save your favorites!</p>
            <button
              onClick={() => router.push('/commercial-search')}
              className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Explore Properties
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => handlePropertyClick(property)}
              >
                <div className="relative h-48 overflow-hidden">
                  {property.imageUrl ? (
                    <Image
                      src={property.imageUrl}
                      alt={property.address || 'Property'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/logoRE.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-primary-black">
                    {property.propertyType || 'Property'}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFavorite(property.propertyId);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-accent-yellow rounded-full flex items-center justify-center transition-all z-20 hover:bg-red-500"
                  >
                    <Trash2 size={18} className="text-primary-black" />
                  </motion.button>
                </div>
                <div className="p-5">
                  <div className="text-xl font-bold text-primary-black mb-2">
                    {property.price || 'Price on request'}
                  </div>
                  <div className="text-sm text-gray-600 mb-1 line-clamp-1">
                    {property.address || 'Address not available'}
                  </div>
                  {(property.city || property.state) && (
                    <div className="text-sm text-gray-500">
                      {[property.city, property.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


