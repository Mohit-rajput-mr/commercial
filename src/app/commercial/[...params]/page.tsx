'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  ArrowLeft, Building2, MapPin, DollarSign, Square, 
  Loader2, ChevronLeft, ChevronRight,
  Info, User, Building, Copy, Check, ArrowRight
} from 'lucide-react';
import ShareButton from '@/components/ShareButton';

// Commercial Property interface
interface CommercialProperty {
  propertyId: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  address?: string;
  description?: string;
  listingUrl?: string;
  images?: string[];
  dataPoints?: string[];
  price?: string | null;
  priceNumeric?: number | null;
  priceCurrency?: string;
  isAuction?: boolean;
  auctionEndDate?: string | null;
  squareFootage?: string | null;
  buildingSize?: string | null;
  numberOfUnits?: number | null;
  brokerName?: string | null;
  brokerCompany?: string | null;
  propertyTypeDetailed?: string | null;
  capRate?: string | null;
  position?: number;
  availability?: string | null;
  com?: number;
  [key: string]: any;
}

function CommercialDetailContent() {
  const params = useParams();
  const router = useRouter();
  
  // Parse params array to handle both formats:
  // - /commercial/crexi-1728502 (params = ['crexi-1728502']) - treat as com ID first
  // - /commercial/com123/crexi-1728502 (params = ['com123', 'crexi-1728502'])
  const paramsArray = typeof params.params === 'string' 
    ? [params.params] 
    : Array.isArray(params.params) 
      ? params.params 
      : [];
  
  let comNumber: number | undefined;
  let propertyId: string = '';
  
  if (paramsArray.length === 2 && paramsArray[0].startsWith('com')) {
    // New format: /commercial/com123/crexi-1728502
    const comStr = paramsArray[0].replace('com', '');
    comNumber = parseInt(comStr);
    propertyId = decodeURIComponent(paramsArray[1]);
  } else if (paramsArray.length === 1) {
    // Single param: try to parse as com number first
    const singleParam = paramsArray[0];
    // Check if it's a numeric com ID
    const parsedCom = parseInt(singleParam);
    if (!isNaN(parsedCom) && parsedCom > 0) {
      // Treat as com ID
      comNumber = parsedCom;
    } else {
      // Treat as property ID (old format)
      propertyId = decodeURIComponent(singleParam);
    }
  }
  
  const [property, setProperty] = useState<CommercialProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Helper function to search all files and assign com
  const findAndAssignCom = async (property: any, propertyId: string): Promise<any | null> => {
    const COMMERCIAL_FILES = [
      'commercial_dataset_17nov2025.json',
      'commercial_dataset_Chicago.json',
      'commercial_dataset_houston.json',
      'commercial_dataset_LA.json',
      'commercial_dataset_ny.json',
      'commercial_dataset2.json',
      'dataset_manhattan_ny.json',
      'dataset_miami_beach.json',
      'dataset_miami_sale.json',
      'dataset_miamibeach_lease.json',
      'dataset_philadelphia_sale.json',
      'dataset_philadelphia.json',
      'dataset_phoenix.json',
      'dataset_san_antonio_sale.json',
      'dataset_son_antonio_lease.json',
      'dataset_las_vegas_sale.json',
      'dataset_lasvegas_lease.json',
      'dataset_austin_lease.json',
      'dataset_austin_sale.json',
      'dataset_los_angeles_lease.json',
      'dataset_los_angeles_sale.json',
      'dataset_sanfrancisco_lease.json',
      'dataset_sanfrancisco_sale.json',
    ];

    const CREXI_FILES = [
      'miami_all_crexi_sale.json',
      'miami_all_crexi_lease.json',
    ];

    let maxCom = 0;

    // First pass: find max com across all files
    for (const filename of [...COMMERCIAL_FILES, ...CREXI_FILES]) {
      try {
        const filePath = filename.startsWith('miami_all_crexi') 
          ? `/${filename}` 
          : `/commercial/${filename}`;
        
        const response = await fetch(filePath);
        if (!response.ok) continue;

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        
        for (const prop of propertiesArray) {
          if (prop.com && prop.com > maxCom) {
            maxCom = prop.com;
          }
        }
      } catch (err) {
        continue;
      }
    }

    // Second pass: find the property and assign com
    for (const filename of [...COMMERCIAL_FILES, ...CREXI_FILES]) {
      try {
        const filePath = filename.startsWith('miami_all_crexi') 
          ? `/${filename}` 
          : `/commercial/${filename}`;
        
        const response = await fetch(filePath);
        if (!response.ok) continue;

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        
        const foundIndex = propertiesArray.findIndex((prop: any) => {
          const propId = prop.propertyId || prop.zpid || prop.id || '';
          const idString = propId.toString();
          return idString === propertyId || 
                 idString === `crexi-sale-${prop.id}` ||
                 idString === `crexi-lease-${prop.id}` ||
                 (prop.id && idString === `crexi-sale-${prop.id.toString()}`) ||
                 (prop.id && idString === `crexi-lease-${prop.id.toString()}`) ||
                 prop.id?.toString() === propertyId;
        });

        if (foundIndex !== -1) {
          const foundProperty = propertiesArray[foundIndex];
          if (!foundProperty.com) {
            foundProperty.com = maxCom + 1;
            // Update the property object
            property.com = maxCom + 1;
            console.log(`✅ Assigned com ${maxCom + 1} to property ${propertyId}`);
          }
          return foundProperty;
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  };

  // Helper function to search all files by com
  const searchAllFilesByCom = async (com: number): Promise<any | null> => {
    const COMMERCIAL_FILES = [
      'commercial_dataset_17nov2025.json',
      'commercial_dataset_Chicago.json',
      'commercial_dataset_houston.json',
      'commercial_dataset_LA.json',
      'commercial_dataset_ny.json',
      'commercial_dataset2.json',
      'dataset_manhattan_ny.json',
      'dataset_miami_beach.json',
      'dataset_miami_sale.json',
      'dataset_miamibeach_lease.json',
      'dataset_philadelphia_sale.json',
      'dataset_philadelphia.json',
      'dataset_phoenix.json',
      'dataset_san_antonio_sale.json',
      'dataset_son_antonio_lease.json',
      'dataset_las_vegas_sale.json',
      'dataset_lasvegas_lease.json',
      'dataset_austin_lease.json',
      'dataset_austin_sale.json',
      'dataset_los_angeles_lease.json',
      'dataset_los_angeles_sale.json',
      'dataset_sanfrancisco_lease.json',
      'dataset_sanfrancisco_sale.json',
    ];

    const CREXI_FILES = [
      'miami_all_crexi_sale.json',
      'miami_all_crexi_lease.json',
    ];

    for (const filename of [...COMMERCIAL_FILES, ...CREXI_FILES]) {
      try {
        const filePath = filename.startsWith('miami_all_crexi') 
          ? `/${filename}` 
          : `/commercial/${filename}`;
        
        const response = await fetch(filePath);
        if (!response.ok) continue;

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        
        const foundProperty = propertiesArray.find((prop: any) => prop.com === com);
        
        if (foundProperty) {
          console.log(`✅ Found property with com ${com} in ${filename}`);
          return foundProperty;
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  };

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId && !comNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // If we have comNumber (from single param or two params), prioritize loading by com
      if (comNumber && !isNaN(comNumber) && comNumber > 0) {
        try {
          const { loadCommercialPropertyByCom } = await import('@/lib/property-loader');
          const property = await loadCommercialPropertyByCom(comNumber);
          
          if (property) {
            // Ensure property has the com field
            if (!property.com) {
              property.com = comNumber;
            }
            setProperty(property);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error loading by com:', err);
        }

        // If not found by com, search all files manually
        const foundProperty = await searchAllFilesByCom(comNumber);
        if (foundProperty) {
          setProperty(foundProperty);
          setLoading(false);
          return;
        }
      }

      // If we have propertyId, try to load from sessionStorage first
      if (propertyId) {
        const storedProperty = sessionStorage.getItem(`commercial_property_${propertyId}`);
        if (storedProperty) {
          try {
            const parsed = JSON.parse(storedProperty);
            // If property has a com but URL doesn't, redirect to com-based URL
            if (parsed.com && !comNumber) {
              router.replace(`/commercial/com${parsed.com}/${encodeURIComponent(propertyId)}`);
              return;
            }
            setProperty(parsed);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse stored property:', e);
          }
        }
      }

      // If we have propertyId, try to load from dataset
      if (propertyId) {
        try {
          const { loadCommercialPropertyFromDataset } = await import('@/lib/property-loader');
          const property = await loadCommercialPropertyFromDataset(propertyId);
          
          if (property) {
            // If property has a com but URL doesn't, redirect to com-based URL
            if (property.com && !comNumber) {
              const propId = property.propertyId || property.zpid || property.id || propertyId;
              router.replace(`/commercial/com${property.com}/${encodeURIComponent(propId)}`);
              return;
            }
            // If property doesn't have com, search all files and assign one
            if (!property.com) {
              // Search all files to find and assign com
              const assignedProperty = await findAndAssignCom(property, propertyId);
              if (assignedProperty) {
                setProperty(assignedProperty);
                setLoading(false);
                return;
              }
            }
            setProperty(property);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error loading commercial property from dataset:', err);
        }
      }

      // If still not found, try loading from all commercial files
      try {
        const COMMERCIAL_FILES = [
          'commercial_dataset_17nov2025.json',
          'commercial_dataset_Chicago.json',
          'commercial_dataset_houston.json',
          'commercial_dataset_LA.json',
          'commercial_dataset_ny.json',
          'commercial_dataset2.json',
          'dataset_manhattan_ny.json',
          'dataset_miami_beach.json',
          'dataset_miami_sale.json',
          'dataset_miamibeach_lease.json',
          'dataset_philadelphia_sale.json',
          'dataset_philadelphia.json',
          'dataset_phoenix.json',
          'dataset_san_antonio_sale.json',
          'dataset_son_antonio_lease.json',
          'dataset_las_vegas_sale.json',
          'dataset_lasvegas_lease.json',
          'dataset_austin_lease.json',
          'dataset_austin_sale.json',
          'dataset_los_angeles_lease.json',
          'dataset_los_angeles_sale.json',
          'dataset_sanfrancisco_lease.json',
          'dataset_sanfrancisco_sale.json',
        ];

        const CREXI_FILES = [
          'miami_all_crexi_sale.json',
          'miami_all_crexi_lease.json',
        ];

        // Search through all files
        for (const filename of [...COMMERCIAL_FILES, ...CREXI_FILES]) {
          try {
            const filePath = filename.startsWith('miami_all_crexi') 
              ? `/${filename}` 
              : `/commercial/${filename}`;
            
            const response = await fetch(filePath);
            if (!response.ok) continue;

            const data = await response.json();
            const propertiesArray = Array.isArray(data) ? data : data.properties || [];
            
            // Search for property by ID or com
            const foundProperty = propertiesArray.find((prop: any) => {
              if (comNumber && !isNaN(comNumber) && comNumber > 0) {
                return prop.com === comNumber || 
                       prop.propertyId === propertyId || 
                       prop.zpid === propertyId ||
                       prop.id === propertyId ||
                       prop.id?.toString() === propertyId;
              }
              const propId = prop.propertyId || prop.zpid || prop.id || '';
              const idString = propId.toString();
              return idString === propertyId || 
                     idString === `crexi-sale-${prop.id}` ||
                     idString === `crexi-lease-${prop.id}` ||
                     (prop.id && idString === `crexi-sale-${prop.id.toString()}`) ||
                     (prop.id && idString === `crexi-lease-${prop.id.toString()}`) ||
                     prop.id?.toString() === propertyId;
            });

            if (foundProperty) {
              // If property has a com but URL doesn't, redirect to com-based URL
              if (foundProperty.com && !comNumber) {
                const propId = foundProperty.propertyId || foundProperty.zpid || foundProperty.id || propertyId;
                router.replace(`/commercial/com${foundProperty.com}/${encodeURIComponent(propId)}`);
                return;
              }

              // Transform property if needed
              let transformedProperty: CommercialProperty = {
                propertyId: foundProperty.propertyId || foundProperty.zpid || foundProperty.id || propertyId,
                listingType: foundProperty.listingType || foundProperty.status || 'For Sale',
                propertyType: foundProperty.propertyType || foundProperty.types?.[0] || 'Commercial',
                city: foundProperty.city || foundProperty.locations?.[0]?.city || foundProperty.location?.city || '',
                state: foundProperty.state || foundProperty.locations?.[0]?.state || foundProperty.location?.state || '',
                zip: foundProperty.zip || foundProperty.locations?.[0]?.zip || foundProperty.location?.zip || '',
                address: foundProperty.address || foundProperty.locations?.[0]?.address || foundProperty.location?.address || '',
                description: foundProperty.description || foundProperty.name || '',
                images: foundProperty.images || foundProperty.media?.map((m: any) => m.url) || [],
                price: foundProperty.price || (foundProperty.askingPrice ? `$${foundProperty.askingPrice.toLocaleString()}` : null),
                priceNumeric: foundProperty.priceNumeric || foundProperty.askingPrice || null,
                squareFootage: foundProperty.squareFootage || foundProperty.squareFootage?.toString() || null,
                brokerCompany: foundProperty.brokerCompany || foundProperty.brokerageName || null,
                propertyTypeDetailed: foundProperty.propertyTypeDetailed || foundProperty.types?.join(', ') || null,
                capRate: foundProperty.capRate || null,
                numberOfUnits: foundProperty.numberOfUnits || foundProperty.numberOfSuites || null,
                availability: foundProperty.availability || foundProperty.status || null,
                com: foundProperty.com,
              };

              setProperty(transformedProperty);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn(`Failed to search in ${filename}:`, err);
            continue;
          }
        }
      } catch (err) {
        console.error('Error searching commercial files:', err);
      }

      setLoading(false);
    };

    loadProperty();
  }, [propertyId, comNumber, router]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/commercial-search');
    }
  };

  // Helper to determine listing type
  const getListingCategory = (listingType?: string): string => {
    if (!listingType) return 'unknown';
    const lt = listingType.toLowerCase();
    if (lt.includes('auction')) return 'auction';
    if (lt.includes('lease')) return 'lease';
    if (lt.includes('sale')) return 'sale';
    return 'unknown';
  };

  // Get listing type badge color
  const getListingBadgeColor = (listingType?: string) => {
    const category = getListingCategory(listingType);
    switch (category) {
      case 'sale': return 'bg-orange-500 text-white';
      case 'lease': return 'bg-green-500 text-white';
      case 'auction': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get listing type label
  const getListingLabel = (listingType?: string) => {
    const category = getListingCategory(listingType);
    switch (category) {
      case 'sale': return 'For Sale';
      case 'lease': return 'For Lease';
      case 'auction': return 'Auction';
      default: return 'Commercial';
    }
  };

  // Format price
  const formatPrice = (price?: string | null, priceNumeric?: number | null) => {
    if (price) return price;
    if (priceNumeric) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(priceNumeric);
    }
    return 'Contact for Price';
  };

  // Format square footage
  const formatSqft = (sqft?: string | number | null) => {
    if (!sqft) return null;
    const sqftStr = typeof sqft === 'number' ? sqft.toString() : sqft;
    if (typeof sqftStr !== 'string') return null;
    return sqftStr.includes('SF') ? sqftStr : `${sqftStr} SF`;
  };

  // Clean address - remove appended SF/Unit info
  const cleanAddress = (address?: string): string => {
    if (!address) return '';
    let cleaned = address
      .replace(/\d{1,3}(,\d{3})*\s*SF\s*(Office|Retail|Industrial|Multifamily|Available|Property|Commercial|Coworking)?\s*(Available)?/gi, '')
      .replace(/\d+\s*Unit\s*(Multifamily|Apartment|Residential)?/gi, '')
      .replace(/\d+\.\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .replace(/\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .trim();
    return cleaned || address;
  };

  const copyAddress = async () => {
    if (property) {
      const cleaned = cleanAddress(property.address);
      const fullAddress = `${cleaned || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`.trim();
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter valid image URLs
  const images = (property?.images || []).filter(img => img && typeof img === 'string' && img.startsWith('http'));
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center">
          <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">The commercial property you&apos;re looking for could not be found.</p>
          <button
            onClick={goBack}
            className="px-5 py-2.5 md:px-6 md:py-3 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const propertyCom = property.com || comNumber;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[40px] md:h-[68px]"></div>
      
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[40px] md:top-[68px] z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <button
                onClick={goBack}
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-primary-black transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-primary-black truncate">
                  Commercial Property {propertyCom ? `(Com: ${propertyCom})` : ''}
                </h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">{cleanAddress(property.address) || 'Address Not Available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${getListingBadgeColor(property.listingType)}`}>
                {getListingLabel(property.listingType)}
              </span>
              {propertyCom && (
                <span className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-blue-500 text-white">
                  Com {propertyCom}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mb-4 md:mb-8">
            <div className="relative h-[250px] sm:h-[350px] md:h-[500px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-200 group">
              <img
                src={images[currentImageIndex]}
                alt={property.address || 'Commercial Property'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  window.open(images[currentImageIndex], '_blank');
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/logoRE.png';
                  target.className = 'w-full h-full object-contain p-8 bg-gray-100';
                }}
              />
              {/* Share Button Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <ShareButton
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={cleanAddress(property.address) || 'Commercial Property'}
                  text={`Check out this commercial property: ${cleanAddress(property.address)}`}
                  variant="icon"
                  iconSize={20}
                />
              </div>
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-primary-black text-xs md:text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2">
                <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg ${getListingBadgeColor(property.listingType)}`}>
                  {getListingLabel(property.listingType)}
                </span>
                {property.propertyType && (
                  <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg bg-primary-black text-white">
                    {property.propertyType}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto pb-2">
                {images.slice(0, 10).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-accent-yellow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/logoRE.png';
                      }}
                    />
                  </button>
                ))}
                {images.length > 10 && (
                  <div className="flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-xs md:text-sm font-medium">
                    +{images.length - 10}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Images Placeholder */}
        {images.length === 0 && (
          <div className="mb-4 md:mb-8 h-[200px] md:h-[300px] bg-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Building2 size={60} className="md:w-20 md:h-20 text-gray-400" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Price & Address Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                <div className="text-2xl md:text-4xl font-bold text-primary-black">
                  {formatPrice(property.price, property.priceNumeric)}
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="text-accent-yellow mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="text-lg font-medium text-primary-black">
                    {cleanAddress(property.address) || 'Address Not Available'}
                  </div>
                  <div className="text-gray-500">
                    {[property.city, property.state, property.zip].filter(Boolean).join(', ')}
                  </div>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>

              {propertyCom && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <strong>Property Com ID:</strong> {propertyCom}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {property.squareFootage && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Square className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{formatSqft(property.squareFootage)}</span>
                  </div>
                )}
                {property.numberOfUnits && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Building className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{property.numberOfUnits} Units</span>
                  </div>
                )}
                {property.capRate && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <DollarSign className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">Cap Rate: {property.capRate}</span>
                  </div>
                )}
                {property.propertyTypeDetailed && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Building2 className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{property.propertyTypeDetailed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                  <Info className="text-accent-yellow" size={20} />
                  Property Description
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Property Highlights */}
            {property.dataPoints && property.dataPoints.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                  <Building2 className="text-accent-yellow" size={20} />
                  Property Highlights
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...new Set(property.dataPoints)].map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                      <span className="text-accent-yellow mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Key Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary-black mb-4">Key Details</h3>
              <div className="space-y-4">
                {property.listingType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Listing Type</span>
                    <span className="font-medium text-primary-black">{getListingLabel(property.listingType)}</span>
                  </div>
                )}
                {property.propertyType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Property Type</span>
                    <span className="font-medium text-primary-black">{property.propertyType}</span>
                  </div>
                )}
                {property.squareFootage && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Size</span>
                    <span className="font-medium text-primary-black">{formatSqft(property.squareFootage)}</span>
                  </div>
                )}
                {property.numberOfUnits && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Units</span>
                    <span className="font-medium text-primary-black">{property.numberOfUnits}</span>
                  </div>
                )}
                {property.capRate && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Cap Rate</span>
                    <span className="font-medium text-primary-black">{property.capRate}</span>
                  </div>
                )}
                {property.availability && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium text-primary-black">{property.availability}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Broker Info */}
            {(property.brokerName || property.brokerCompany) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                  <User className="text-accent-yellow" size={20} />
                  Listed By
                </h3>
                <div className="text-gray-600">
                  {property.brokerName && <div className="font-medium text-primary-black">{property.brokerName}</div>}
                  {property.brokerCompany && <div className="text-gray-500">{property.brokerCompany}</div>}
                </div>
              </div>
            )}

            {/* Location Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                <MapPin className="text-accent-yellow" size={20} />
                Location
              </h3>
              <div className="text-gray-600">
                <p className="mb-2">{property.address}</p>
                <p>{property.city}, {property.state} {property.zip}</p>
                {property.country && <p className="text-gray-400 text-sm mt-1">{property.country}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Property ID Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Property ID: {property.propertyId} {propertyCom && `| Com: ${propertyCom}`}
        </div>
      </div>
    </div>
  );
}

export default function CommercialDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin" />
        </div>
      </div>
    }>
      <CommercialDetailContent />
    </Suspense>
  );
}

