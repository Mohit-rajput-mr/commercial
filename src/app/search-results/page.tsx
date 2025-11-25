'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Heart,
  Filter,
  SlidersHorizontal,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Property } from '@/types/property';
import { allProperties } from '@/data/sampleProperties';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { AddressSuggestion } from '@/lib/addressAutocomplete';
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';


function PropertyCard({ 
  property, 
  isSelected, 
  onSelect,
  onFavorite 
}: { 
  property: Property;
  isSelected: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFav(favorites.includes(property.id));
  }, [property.id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFav
      ? favorites.filter((id: string) => id !== property.id)
      : [...favorites, property.id];
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFav(!isFav);
    onFavorite();
  };

  return (
    <Link href={`/property/${property.id}`}>
      <motion.div
        onClick={onSelect}
        className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
          isSelected ? 'border-accent-yellow' : 'border-transparent'
        }`}
        whileHover={{ y: -4 }}
      >
        <div className="relative h-48 w-full">
          <Image
            src={property.imageUrl}
            alt={property.address}
            fill
            className="object-cover"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
          >
            <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
          <div className="absolute bottom-2 left-2 bg-accent-yellow px-3 py-1 rounded font-bold text-sm text-primary-black">
            {property.price}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-primary-black mb-1">{property.address}</h3>
          <p className="text-sm text-custom-gray mb-2">
            {property.city}, {property.state} {property.zipCode}
          </p>
          <div className="flex items-center gap-4 text-sm text-custom-gray">
            <span>{property.type}</span>
            <span>•</span>
            <span>{property.size}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SearchResultsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [similarNeighborhoods] = useState([
    'Brickell', 'Miami Shores', 'Edgewater', 'Downtown Miami', 'Morningside'
  ]);

  // Update search query when URL params change
  useEffect(() => {
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    setSearchQuery(location);
    setPropertyType(type);
  }, [searchParams]);

  // Filter and sort properties from sample data
  const filteredProperties = useMemo(() => {
    let results = [...allProperties];

    // Filter by location
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.city.toLowerCase().includes(queryLower) ||
        p.state.toLowerCase().includes(queryLower) ||
        p.zipCode.includes(queryLower) ||
        p.address.toLowerCase().includes(queryLower)
      );
    }

    // Filter by property type
    if (propertyType) {
      results = results.filter(p => p.type === propertyType);
    }

    // Filter by price range
    if (priceMin) {
      const minPrice = parseFloat(priceMin);
      results = results.filter(p => p.pricePerSF >= minPrice);
    }
    if (priceMax) {
      const maxPrice = parseFloat(priceMax);
      results = results.filter(p => p.pricePerSF <= maxPrice);
    }

    // Sort
    if (sortBy === 'price-low') {
      results = [...results].sort((a, b) => a.pricePerSF - b.pricePerSF);
    } else if (sortBy === 'price-high') {
      results = [...results].sort((a, b) => b.pricePerSF - a.pricePerSF);
    } else if (sortBy === 'newest') {
      results = [...results].sort((a, b) => (b.yearBuilt || 0) - (a.yearBuilt || 0));
    }

    return results;
  }, [searchQuery, propertyType, priceMin, priceMax, sortBy]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('location', searchQuery);
    if (propertyType) params.set('type', propertyType);
    router.push(`/search-results?${params.toString()}`);
  };

  const handlePropertySelect = useCallback((id: string) => {
    setSelectedProperty(id);
    // Scroll to property card
    const element = document.getElementById(`property-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Navbar Spacer - Prevents content overlap */}
      <div className="h-[50px] w-full"></div>
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[50px] z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Input */}
            <div className="flex-1 relative w-full md:w-auto">
              <AddressAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={(suggestion: AddressSuggestion) => {
                  if (suggestion.id && !suggestion.id.startsWith('place-')) {
                    router.push(`/property/${suggestion.id}`);
                  } else {
                    setSearchQuery(suggestion.fullAddress);
                    handleSearch();
                  }
                }}
                placeholder="Enter a location (City, State, or ZIP)"
                className="w-full"
                showIcon={false}
              />
            </div>

            {/* Similar Neighborhoods */}
            <div className="flex flex-wrap gap-2">
              {similarNeighborhoods.map((neighborhood) => (
                <button
                  key={neighborhood}
                  onClick={() => {
                    setSearchQuery(neighborhood);
                    handleSearch();
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {neighborhood}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">$ No Min</option>
                  <option value="10">$10</option>
                  <option value="20">$20</option>
                  <option value="30">$30</option>
                  <option value="40">$40</option>
                </select>
                <span className="text-gray-500">-</span>
                <select
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">$ No Max</option>
                  <option value="20">$20</option>
                  <option value="30">$30</option>
                  <option value="40">$40</option>
                  <option value="50">$50</option>
                </select>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Results Count and Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <p className="text-sm text-custom-gray">
              {filteredProperties.length > 0 ? `1-${filteredProperties.length}` : '0'} of {filteredProperties.length} Properties
            </p>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg"
              >
                <option value="recommended">Sort by Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <button className="px-4 py-2.5 text-sm bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400 flex items-center gap-2">
                <Save size={18} />
                Save Search
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6 space-y-4">
            {/* Promotional Banner (First Card) */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Cap Rate Private Exclusives</h3>
              <p className="text-sm mb-4">Get early access to premium properties before they hit the market.</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                Learn More
              </button>
            </div>

            {/* Property Cards Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} id={`property-${property.id}`}>
                    <PropertyCard
                      property={property}
                      isSelected={selectedProperty === property.id}
                      onSelect={() => handlePropertySelect(property.id)}
                      onFavorite={() => {}}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-custom-gray mb-2">No properties found</p>
                <p className="text-sm text-custom-gray">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

      {/* Filters Sidebar/Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-black">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Filter Options */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Property Type</h3>
                    <div className="space-y-2">
                      {['Office', 'Retail', 'Industrial', 'Restaurant', 'Medical', 'Flex', 'Coworking', 'Land'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propertyType === type}
                            onChange={() => setPropertyType(propertyType === type ? '' : type)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="Min"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="Max"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Size (SqFt)</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => {
                      setPriceMin('');
                      setPriceMax('');
                      setPropertyType('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <Footer />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="h-[50px] w-full"></div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PropertyGridSkeleton count={6} />
        </div>
        <Footer />
      </div>
    }>
      <SearchResultsPageContent />
    </Suspense>
  );
}

