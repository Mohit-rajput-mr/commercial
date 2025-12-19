'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { APIProperty } from '@/lib/property-api';
import { CommercialProperty } from '@/lib/us-real-estate-api';
import { geocodeAddress } from '@/lib/geocoding';
import { MapPin, Loader2 } from 'lucide-react';
// @ts-ignore - CSS imports don't have type definitions
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.css';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Leaflet types
type LeafletMap = any;
type LeafletMarker = any;
type LeafletLayer = any;
type LeafletMarkerClusterGroup = any;

interface MapViewProps {
  properties: (APIProperty | CommercialProperty)[];
  centerLocation?: string;
  onMarkerClick?: (propertyId: string) => void;
  onMarkerHover?: (propertyId: string | null) => void;
  highlightedPropertyId?: string | null;
  showResidential?: boolean;
  showCommercial?: boolean;
}

// Clean white/blue map style - Positron
const MAP_TILE_URL = 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?&apiKey=f396d0928e4b41eeac1751e01b3a444e';

// Determine if property is commercial or residential
const isCommercialProperty = (property: APIProperty | CommercialProperty): boolean => {
  const propType = (property.propertyType || '').toLowerCase();
  const commercialTypes = ['commercial', 'office', 'retail', 'industrial', 'warehouse', 'medical', 'land', 'hotel', 'mixed', 'flex', 'special', 'multifamily'];
  return commercialTypes.some(type => propType.includes(type));
};

// Create custom marker icon SVG (mobile-first: smaller on mobile, normal on desktop)
const createMarkerIcon = (isCommercial: boolean, isHighlighted: boolean = false, isMobile: boolean = false): string => {
  const color = isCommercial ? '#f59e0b' : '#3b82f6';
  const baseScale = isMobile ? 0.75 : 1; // 25% smaller on mobile
  const highlightScale = isHighlighted ? 1.3 : 1;
  const finalScale = baseScale * highlightScale;
  const scale = `transform: scale(${finalScale});`;
  const shadow = isHighlighted ? 'filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));' : 'filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));';
  
  return `<div style="${scale} ${shadow} transition: transform 0.2s ease;">
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26s18-12.5 18-26c0-9.941-8.059-18-18-18z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="16" r="8" fill="white"/>
      ${isCommercial 
        ? '<rect x="13" y="11" width="10" height="10" rx="1" fill="' + color + '"/>' 
        : '<path d="M18 10l-6 5v7h4v-5h4v5h4v-7l-6-5z" fill="' + color + '"/>'
      }
    </svg>
  </div>`;
};

// Geocoded property cache
interface GeocodedProperty {
  property: APIProperty | CommercialProperty;
  lat: number;
  lng: number;
}

export default function MapView({
  properties,
  centerLocation,
  onMarkerClick,
  onMarkerHover,
  highlightedPropertyId,
  showResidential = true,
  showCommercial = true
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const markerClusterGroupRef = useRef<LeafletMarkerClusterGroup | null>(null);
  const leafletRef = useRef<any>(null);
  const geocodedPropertiesRef = useRef<Map<string, GeocodedProperty>>(new Map());
  const isGeocodingRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState({ done: 0, total: 0, phase: 'idle' as 'idle' | 'geocoding' | 'rendering' | 'complete' });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    let mounted = true;

    async function initMap() {
      try {
        const L = (await import('leaflet')).default;
        leafletRef.current = L;
        await import('leaflet.markercluster');

        if (!mounted || !mapRef.current) return;
        if ((mapRef.current as any)._leaflet_id) {
          setIsLoading(false);
          setMapReady(true);
          return;
        }

        // Get initial center from search location
        let initialCenter: [number, number] = [25.7617, -80.1918];
        let initialZoom = 11;

        if (centerLocation) {
          const geocoded = await geocodeAddress(centerLocation);
          if (geocoded) {
            initialCenter = [geocoded.lat, geocoded.lng];
          }
        }

        const map = L.map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          minZoom: 8,
          maxZoom: 18,
          zoomControl: true,
        });
        
        mapInstanceRef.current = map;

        L.tileLayer(MAP_TILE_URL, {
          attribution: '© Geoapify',
          maxZoom: 20,
        }).addTo(map);

        // Cluster group with NO animation for instant display (mobile-first: smaller clusters on mobile)
        const clusterSize = window.innerWidth < 768 ? 36 : 44; // Smaller on mobile
        const clusterFontSize = window.innerWidth < 768 ? 12 : 14; // Smaller font on mobile
        const clusterBorder = window.innerWidth < 768 ? 2 : 3; // Thinner border on mobile
        
        const markerClusterGroup = (L as any).markerClusterGroup({
          chunkedLoading: false, // Load all at once
          animate: false, // No animation
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: window.innerWidth < 768 ? 40 : 50, // Tighter clustering on mobile
          disableClusteringAtZoom: 16, // Show individual pins at zoom 16+
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            const markers = cluster.getAllChildMarkers();
            
            let commercialCount = 0;
            markers.forEach((marker: any) => {
              if (marker.options.isCommercial) commercialCount++;
            });
            
            const bgColor = commercialCount > markers.length / 2 ? '#f59e0b' : '#3b82f6';
            
            return L.divIcon({
              html: `<div style="
                background: ${bgColor};
                color: white;
                width: ${clusterSize}px;
                height: ${clusterSize}px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${clusterFontSize}px;
                border: ${clusterBorder}px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(clusterSize, clusterSize),
            });
          }
        });
        map.addLayer(markerClusterGroup);
        markerClusterGroupRef.current = markerClusterGroup;

        setIsLoading(false);
        setMapReady(true);

      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
        markerClusterGroupRef.current = null;
      }
    };
  }, [centerLocation]);

  // Geocode ALL properties first, then render ALL pins at once
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markerClusterGroupRef.current || !leafletRef.current) return;
    if (properties.length === 0) return;
    if (isGeocodingRef.current) return;

    const L = leafletRef.current;

    async function geocodeAndRenderAll() {
      isGeocodingRef.current = true;
      
      // Filter properties based on type
      const filteredProperties = properties.filter(property => {
        const isCommercial = isCommercialProperty(property);
        if (isCommercial && !showCommercial) return false;
        if (!isCommercial && !showResidential) return false;
        return true;
      });

      if (filteredProperties.length === 0) {
        markerClusterGroupRef.current?.clearLayers();
        markersRef.current.clear();
        setGeocodingStatus({ done: 0, total: 0, phase: 'complete' });
        isGeocodingRef.current = false;
        return;
      }

      console.log('🚀 Starting batch geocoding for', filteredProperties.length, 'properties');
      setGeocodingStatus({ done: 0, total: filteredProperties.length, phase: 'geocoding' });

      // PHASE 1: Geocode all addresses in parallel batches
      const geocodedList: GeocodedProperty[] = [];
      const batchSize = 20; // Larger batches for speed
      
      for (let i = 0; i < filteredProperties.length; i += batchSize) {
        const batch = filteredProperties.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(batch.map(async (property) => {
          const propertyId = property.zpid || '';
          
          // Check cache first
          if (geocodedPropertiesRef.current.has(propertyId)) {
            return geocodedPropertiesRef.current.get(propertyId)!;
          }

          let lat: number | null = null;
          let lng: number | null = null;

          // Use existing coordinates if available
          if (property.latitude && property.longitude) {
            lat = property.latitude;
            lng = property.longitude;
          } else {
            // Geocode the address
            const address = typeof property.address === 'string' 
              ? property.address 
              : (property.address as any)?.streetAddress || '';
            
            const fullAddress = `${address}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`.trim();
            
            if (fullAddress.length > 5) {
              try {
                const geocoded = await geocodeAddress(fullAddress);
                if (geocoded) {
                  lat = geocoded.lat;
                  lng = geocoded.lng;
                }
              } catch (err) {
                // Skip errors
              }
            }
          }

          if (lat && lng) {
            const result: GeocodedProperty = { property, lat, lng };
            geocodedPropertiesRef.current.set(propertyId, result);
            return result;
          }
          return null;
        }));

        // Add successful results
        batchResults.forEach(result => {
          if (result) geocodedList.push(result);
        });

        // Update progress
        setGeocodingStatus({ 
          done: Math.min(i + batchSize, filteredProperties.length), 
          total: filteredProperties.length, 
          phase: 'geocoding' 
        });
      }

      console.log('✅ Geocoding complete:', geocodedList.length, 'addresses resolved');
      setGeocodingStatus({ done: geocodedList.length, total: geocodedList.length, phase: 'rendering' });

      // PHASE 2: Clear old markers and create ALL new markers
      markerClusterGroupRef.current?.clearLayers();
      markersRef.current.clear();

      const allMarkers: any[] = [];

      const isMobileView = window.innerWidth < 768;
      
      geocodedList.forEach(({ property, lat, lng }) => {
        const isCommercial = isCommercialProperty(property);
        const propertyId = property.zpid || `prop-${Math.random()}`;
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: createMarkerIcon(isCommercial, highlightedPropertyId === propertyId, isMobileView),
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([lat, lng], { 
          icon: customIcon,
          isCommercial: isCommercial
        });

        // Popup content
        const imgSrc = property.imgSrc || (property.images && property.images[0]) || '';
        const propertyName = typeof property.address === 'string' 
          ? property.address.substring(0, 60) 
          : (property.address as any)?.streetAddress?.substring(0, 60) || 'Property';
        const price = property.price ? `$${property.price.toLocaleString()}` : 'Price N/A';
        const typeLabel = isCommercial ? 'Commercial' : 'Residential';
        const typeBadgeColor = isCommercial ? '#f59e0b' : '#3b82f6';

        // Mobile-first popup: smaller, more compact
        const popupWidth = isMobileView ? 180 : 220;
        const imgHeight = isMobileView ? 90 : 120;
        const badgeFontSize = isMobileView ? 10 : 11;
        const nameFontSize = isMobileView ? 12 : 13;
        const cityFontSize = isMobileView ? 10 : 11;
        const priceFontSize = isMobileView ? 14 : 16;
        
        marker.bindPopup(`
          <div style="min-width: ${popupWidth}px; font-family: system-ui, sans-serif;">
            ${imgSrc ? `<img src="${imgSrc}" style="width: 100%; height: ${imgHeight}px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" onerror="this.style.display='none'" />` : ''}
            <span style="background: ${typeBadgeColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: ${badgeFontSize}px; font-weight: 600;">${typeLabel}</span>
            <div style="font-weight: 600; font-size: ${nameFontSize}px; margin: 5px 0 3px; line-height: 1.3;">${propertyName}</div>
            <div style="font-size: ${cityFontSize}px; color: #666; margin-bottom: 3px;">${property.city || ''}, ${property.state || ''}</div>
            <div style="font-weight: 700; font-size: ${priceFontSize}px; color: ${typeBadgeColor};">${price}</div>
            <div style="font-size: ${cityFontSize}px; color: #3b82f6; margin-top: 4px; cursor: pointer;">👉 Click to view details</div>
          </div>
        `, { 
          maxWidth: isMobileView ? 200 : 280,
          autoPan: false, // Disable auto-pan when popup opens
          closeButton: false // Remove close button for cleaner look
        });

        marker.on('click', () => { 
          marker.openPopup(); // Show popup on click
          onMarkerClick?.(propertyId); 
        });
        marker.on('mouseover', () => { onMarkerHover?.(propertyId); marker.openPopup(); });
        marker.on('mouseout', () => onMarkerHover?.(null));

        markersRef.current.set(propertyId, marker);
        allMarkers.push(marker);
      });

      // PHASE 3: Add ALL markers at once - instant display!
      if (allMarkers.length > 0 && markerClusterGroupRef.current) {
        markerClusterGroupRef.current.addLayers(allMarkers);
        console.log('🎯 All', allMarkers.length, 'pins rendered at once!');
      }

      setGeocodingStatus({ done: allMarkers.length, total: allMarkers.length, phase: 'complete' });
      isGeocodingRef.current = false;
    }

    geocodeAndRenderAll();
  }, [properties, mapReady, showResidential, showCommercial, onMarkerClick, onMarkerHover, highlightedPropertyId]);

  // Highlight marker when property is hovered from list
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;

    const L = leafletRef.current;

    const isMobileView = window.innerWidth < 768;
    
    markersRef.current.forEach((marker, propertyId) => {
      const isHighlighted = highlightedPropertyId === propertyId;
      const isCommercial = marker.options.isCommercial;
      
      marker.setIcon(L.divIcon({
        className: 'custom-marker',
        html: createMarkerIcon(isCommercial, isHighlighted, isMobileView),
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
      }));
      
      // Only open popup when highlighted, but DON'T move the map
      if (isHighlighted && mapInstanceRef.current) {
        // Check if marker has a popup before trying to open it
        if (marker.getPopup()) {
          marker.openPopup();
        }
        // REMOVED: mapInstanceRef.current.panTo() - no auto-adjustment
      }
    });
  }, [highlightedPropertyId, mapReady]);

  const pinsOnMap = markersRef.current.size;
  const visibleCommercial = properties.filter(p => isCommercialProperty(p) && showCommercial).length;
  const visibleResidential = properties.filter(p => !isCommercialProperty(p) && showResidential).length;

  return (
    <div className="relative w-full h-full bg-gray-100 z-[1]">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={40} />
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Geocoding Progress - Mobile-first: smaller, more compact */}
      {!isLoading && geocodingStatus.phase !== 'complete' && geocodingStatus.phase !== 'idle' && (
        <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 md:px-5 py-2 md:py-3 z-[1000] max-w-[90%] md:max-w-none">
          <div className="flex items-center gap-2 md:gap-3">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <div>
              <div className="text-xs md:text-sm font-medium text-gray-700">
                {geocodingStatus.phase === 'geocoding' ? 'Loading...' : 'Rendering...'}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">
                {geocodingStatus.done} / {geocodingStatus.total}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 md:mt-2 h-1 md:h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(geocodingStatus.done / geocodingStatus.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Legend - Mobile-first: smaller, more compact */}
      {!isLoading && geocodingStatus.phase === 'complete' && (
        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white rounded-lg md:rounded-xl shadow-lg px-2.5 md:px-4 py-2 md:py-3 z-[1000]">
          <div className="text-[10px] md:text-xs text-gray-500 mb-1 md:mb-2">{pinsOnMap} pins</div>
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            {showCommercial && (
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-amber-500"></div>
                <span className="font-medium text-gray-700 text-[11px] md:text-sm">{visibleCommercial}</span>
              </div>
            )}
            {showResidential && (
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500"></div>
                <span className="font-medium text-gray-700 text-[11px] md:text-sm">{visibleResidential}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
