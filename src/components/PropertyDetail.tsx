'use client';

import { useState } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Share2, Download, GitCompare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/types/property';

interface PropertyDetailProps {
  property: Property;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const [showSaveTooltip, setShowSaveTooltip] = useState(false);
  const [expandedSpace, setExpandedSpace] = useState<string | null>(null);

  const breadcrumbs = [
    { label: property.type + ' Spaces', href: '/?type=' + property.type },
    { label: property.state, href: '/?state=' + property.state },
    { label: property.city, href: '/?city=' + property.city },
    { label: property.address, href: '#' },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setShowSaveTooltip(true);
    setTimeout(() => setShowSaveTooltip(false), 3000);
    
    // Save to localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!isFavorite) {
      favorites.push(property.id);
    } else {
      const index = favorites.indexOf(property.id);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-light-gray py-3 px-5">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-custom-gray">/</span>}
                <Link
                  href={crumb.href}
                  className={`hover:text-accent-yellow transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'text-primary-black font-semibold'
                      : 'text-custom-gray'
                  }`}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Header Bar */}
      <div className="border-b border-gray-200 py-4 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-32">
              <Image
                src="/assets/logoRE.png"
                alt="Cap Rate"
                fill
                className="object-contain object-left"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-black">{property.address}</h1>
              <p className="text-custom-gray">
                {property.size} of {property.type} Space Available in {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
          </div>
          <div className="text-sm text-custom-gray">METROVATION</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden group">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.address}
                fill
                className="object-cover"
                priority
              />
              
              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} className="text-primary-black" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={24} className="text-primary-black" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-light-gray transition-colors">
                <GitCompare size={20} />
                <span className="hidden sm:inline">Compare</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-light-gray transition-colors">
                <Download size={20} />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-light-gray transition-colors">
                <Share2 size={20} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <div className="relative">
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    isFavorite
                      ? 'border-accent-yellow bg-accent-yellow/10 text-accent-yellow'
                      : 'border-gray-300 hover:bg-light-gray'
                  }`}
                  onMouseEnter={() => setShowSaveTooltip(true)}
                  onMouseLeave={() => setShowSaveTooltip(false)}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">Favorite</span>
                </button>
                {showSaveTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-primary-black text-white p-4 rounded-lg shadow-lg z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">Save this listing!</h4>
                      <button onClick={() => setShowSaveTooltip(false)} className="text-white/70 hover:text-white">
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-white/80">
                      Favorite this listing to get notified of price updates, new media and more
                    </p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-black" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights Section */}
            <div>
              <h2 className="text-2xl font-bold text-primary-black mb-4">HIGHLIGHTS</h2>
              <ul className="space-y-3">
                {property.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-accent-yellow mt-1">•</span>
                    <span className="text-custom-gray">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Space Availability Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary-black">SPACE AVAILABILITY ({property.spaceAvailability.length})</h2>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Display Rental Rate as $/SF/YR</option>
                </select>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">SPACE</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">SIZE</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">TERM</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">RENTAL RATE</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-primary-black">RENT TYPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.spaceAvailability.map((space, index) => (
                      <React.Fragment key={`space-${index}`}>
                        <tr
                          className="border-t border-gray-200 hover:bg-light-gray cursor-pointer"
                          onClick={() => setExpandedSpace(expandedSpace === space.space ? null : space.space)}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span>{space.space}</span>
                              {space.interiorPhotos && space.interiorPhotos.length > 0 && (
                                <span className="text-xs text-custom-gray">📐</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-accent-yellow/20 text-primary-black px-2 py-1 rounded text-xs font-semibold">
                              NEW
                            </span>
                            <span className="ml-2">{space.size}</span>
                          </td>
                          <td className="px-4 py-4">{space.term}</td>
                          <td className="px-4 py-4 font-semibold">{space.rentalRate}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span>{space.rentType}</span>
                              <span className="text-xs text-custom-gray cursor-help" title="Triple Net (NNN) means tenant pays base rent plus property taxes, insurance, and maintenance">ℹ️</span>
                            </div>
                          </td>
                        </tr>
                        {expandedSpace === space.space && space.interiorPhotos && (
                          <tr key={`expanded-${index}`}>
                            <td colSpan={5} className="px-4 py-4 bg-light-gray">
                              <div className="flex gap-4 overflow-x-auto">
                                {space.interiorPhotos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="flex-shrink-0 w-48 h-32 relative rounded-lg overflow-hidden">
                                    <Image
                                      src={photo}
                                      alt={`Interior ${photoIndex + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-light-gray rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <a href={`tel:${property.agent.phone}`} className="text-2xl font-bold text-primary-black hover:text-accent-yellow transition-colors">
                  {property.agent.phone}
                </a>
                <button className="w-full mt-4 px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all">
                  Message
                </button>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="font-semibold text-primary-black mb-4">CONTACT</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={property.agent.photo}
                      alt={property.agent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-black">{property.agent.name}</p>
                    <p className="text-sm text-custom-gray">{property.agent.company}</p>
                  </div>
                </div>
                <div className="relative h-12 w-32 mb-4">
                  <Image
                    src={property.agent.companyLogo}
                    alt={property.agent.company}
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-300">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite
                        ? 'bg-accent-yellow/20 text-accent-yellow'
                        : 'hover:bg-white'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

