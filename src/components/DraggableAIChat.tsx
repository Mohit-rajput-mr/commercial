'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, User, Move, Minimize2, StopCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AddressObject {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

interface PropertyData {
  propertyId?: string;
  zpid?: string;
  address?: string | AddressObject;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipcode?: string;
  price?: string | number;
  priceNumeric?: number;
  propertyType?: string;
  propertyTypeDetailed?: string;
  homeType?: string;
  listingType?: string;
  listingUrl?: string;
  images?: string[];
  imgSrc?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotAreaValue?: number;
  yearBuilt?: number;
  status?: string;
  squareFootage?: string;
  buildingSize?: string;
  capRate?: string;
  numberOfUnits?: number;
  dataSource?: 'commercial' | 'residential';
}

interface DraggableAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Format message content with bold highlighting
const formatMessageContent = (content: string): React.ReactNode => {
  const parts: Array<{ text: string; bold: boolean }> = [];
  let remaining = content;
  let keyCounter = 0;

  const boldSections: string[] = [];
  remaining = remaining.replace(/\*\*(.+?)\*\*/g, (match, text) => {
    const placeholder = `__BOLD_${boldSections.length}__`;
    boldSections.push(text);
    return placeholder;
  });

  const patterns = [
    /\$[\d,]+(?:\.\d{2})?(?:K|M|B)?/gi,
    /\d+%/g,
    /\b\d+[\d,]*\s*(Properties?|Listings?|Visitors?|B|M|K|USD|sqft|sq\s*ft|acres?|bedrooms?|baths?)\b/gi,
    /\b(Office|Retail|Industrial|Flex|Coworking|Medical|Restaurant|Land|Multifamily|Hospitality)\b/gi,
    /\b(For Lease|For Sale|Auctions?|Featured|Premium|Exclusive|New|Available|Contact|Schedule|Viewing)\b/gi,
  ];

  const allMatches: Array<{ start: number; end: number; text: string }> = [];
  
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(remaining)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
  });

  allMatches.sort((a, b) => a.start - b.start);

  const filteredMatches: typeof allMatches = [];
  allMatches.forEach(match => {
    const lastMatch = filteredMatches[filteredMatches.length - 1];
    if (!lastMatch || match.start >= lastMatch.end) {
      filteredMatches.push(match);
    }
  });

  let lastIndex = 0;
  filteredMatches.forEach(match => {
    if (match.start > lastIndex) {
      parts.push({ text: remaining.slice(lastIndex, match.start), bold: false });
    }
    parts.push({ text: match.text, bold: true });
    lastIndex = match.end;
  });

  if (lastIndex < remaining.length) {
    parts.push({ text: remaining.slice(lastIndex), bold: false });
  }

  if (parts.length === 0) {
    parts.push({ text: remaining, bold: false });
  }

  const result: React.ReactNode[] = [];
  parts.forEach((part) => {
    let text = part.text;
    
    if (text.includes('__BOLD_')) {
      const segments = text.split(/(__BOLD_\d+__)/g);
      segments.forEach((segment) => {
        const placeholderMatch = segment.match(/__BOLD_(\d+)__/);
        if (placeholderMatch) {
          const boldText = boldSections[parseInt(placeholderMatch[1])];
          if (boldText) {
            result.push(
              <strong key={`bold-${keyCounter++}`} className="font-bold">
                {boldText}
              </strong>
            );
          }
        } else if (segment) {
          if (part.bold) {
            result.push(
              <strong key={`highlight-${keyCounter++}`} className="font-bold">
                {segment}
              </strong>
            );
          } else {
            result.push(segment);
          }
        }
      });
    } else {
      if (part.bold) {
        result.push(
          <strong key={`highlight-${keyCounter++}`} className="font-bold">
            {text}
          </strong>
        );
      } else {
        result.push(text);
      }
    }
  });

  return result.length > 0 ? <>{result}</> : content;
};

// Comprehensive site knowledge base
const SITE_KNOWLEDGE = {
  name: "Commercial Real Estate Platform",
  description: "A comprehensive real estate platform for both commercial and residential properties",
  features: {
    search: "Advanced property search with filters for location, type, price, beds, baths",
    datasets: {
      commercial: ["Miami", "Chicago", "Houston", "LA", "New York", "Philadelphia", "Phoenix", "San Antonio", "Seattle", "Boston", "Las Vegas"],
      residential: ["Miami Beach", "Chicago", "Houston", "LA", "New York", "Philadelphia", "Phoenix"],
      crexi: {
        sale: "Comprehensive Miami commercial sale properties",
        lease: "Comprehensive Miami commercial lease properties"
      }
    },
    propertyTypes: {
      commercial: ["Office", "Retail", "Industrial", "Multifamily", "Land", "Hospitality", "Healthcare", "Mixed Use"],
      residential: ["Single Family", "Condo", "Townhouse", "Multi-Family"]
    },
    pages: {
      home: "Main landing page with hero search",
      commercialSearch: "/commercial-search - Browse commercial properties with map view",
      residentialSearch: "/unified-search - Browse residential properties with map view",
      propertyDetail: "Detailed property information with images, specs, and location",
      markets: "City-specific market information and trends"
    },
    filters: {
      commercial: ["Listing Type (Sale/Lease)", "Property Type", "Price Range"],
      residential: ["Price Range", "Bedrooms (1+, 2+, 3+, 4+)", "Bathrooms (1+, 2+, 3+)"]
    },
    mapFeatures: "Interactive maps with property pins, clusters, and popups showing property details"
  },
  howToUse: {
    search: "Use the hero section to search by city, or navigate to Commercial/Residential search pages",
    filters: "Apply filters to narrow down results - all filters persist in URL for easy sharing",
    mapView: "Click map pins to see property details, click again to navigate to full property page",
    propertyCards: "Each card shows key details - click to view full information"
  }
};

export default function DraggableAIChat({ isOpen, onClose }: DraggableAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! 👋 I\'m your **AI Real Estate Assistant**!\n\nI can help you:\n🏢 Find **commercial** properties (offices, retail, industrial)\n🏠 Search **residential** homes\n📍 Navigate the site\n💡 Answer questions about features\n\nWhat would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [allPropertyData, setAllPropertyData] = useState<PropertyData[]>([]);
  const [datasetStats, setDatasetStats] = useState({ commercial: 0, residential: 0 });
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  
  // Drag state - initialize with safe default, update on mount
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Set initial position near AI icon (bottom-right) after mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Position near the AI icon - bottom right corner
      const x = window.innerWidth - 420; // 380px width + 40px margin
      const y = window.innerHeight - 580; // 500px height + 80px margin from bottom
      setPosition({ x, y });
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAbortedRef = useRef(false); // Use ref for immediate abort checking

  // Load ALL property datasets - COMPREHENSIVE
  useEffect(() => {
    const loadAllDatasets = async () => {
      console.log('🤖 AI Training: Loading ALL property datasets...');
      const allData: PropertyData[] = [];
      let loadedFiles = 0;
      
      // COMMERCIAL FILES - All datasets
      const commercialFiles = [
        'commercial_dataset_17nov2025.json',
        'commercial_dataset_Chicago.json',
        'commercial_dataset_houston.json',
        'commercial_dataset_LA.json',
        'commercial_dataset_ny.json',
        'dataset_manhattan_ny.json',
        'dataset_miami_beach.json',
        'dataset_miamibeach_lease.json',
        'dataset_miami_sale.json',
        'dataset_philadelphia.json',
        'dataset_philadelphia_sale.json',
        'dataset_phoenix.json',
        'dataset_san_antonio_sale.json',
        'dataset_son_antonio_lease.json',
        'dataset_seattle.json',
        'dataset_boston.json',
        'dataset_las_vegas_sale.json',
        'dataset-las_vegas_lease.json'
      ];

      // Load ALL commercial properties
      for (const file of commercialFiles) {
        try {
          const response = await fetch(`/commercial/${file}`);
          if (response.ok) {
            const data = await response.json();
            const properties = Array.isArray(data) ? data : data.properties || [];
            properties.forEach((p: PropertyData) => {
              allData.push({ 
                ...p, 
                dataSource: 'commercial',
                listingType: p.listingType || (file.includes('lease') ? 'lease' : 'sale')
              });
            });
            loadedFiles++;
            console.log(`✅ Loaded ${properties.length} properties from ${file}`);
          }
        } catch (e) {
          console.log(`❌ Failed to load ${file}`);
        }
      }

      // CREXI DATASETS - Comprehensive Miami commercial
      const crexiFiles = [
        { file: 'miami_all_crexi_sale.json', type: 'sale' },
        { file: 'miami_all_crexi_lease.json', type: 'lease' }
      ];

      for (const { file, type } of crexiFiles) {
        try {
          const response = await fetch(`/${file}`);
          if (response.ok) {
            const data = await response.json();
            const properties = Array.isArray(data) ? data : data.properties || [];
            properties.forEach((p: any) => {
              allData.push({
                ...p,
                dataSource: 'commercial',
                listingType: type,
                propertyType: p.propertyType || p.type,
                city: p.city || 'Miami',
                state: p.state || 'FL'
              });
            });
            loadedFiles++;
            console.log(`✅ Loaded ${properties.length} Crexi ${type} properties`);
          }
        } catch (e) {
          console.log(`❌ Failed to load Crexi ${type}`);
        }
      }

      // RESIDENTIAL FILES - ALL lease and sale properties
      const residentialFolders = ['lease', 'sale'];
      for (const folder of residentialFolders) {
        try {
          // Try to load known residential files directly
          const knownFiles = [
            'miami_beach_sale.json',
            'miami_beach_lease.json',
            'chicago_sale.json',
            'chicago_lease.json',
            'houston_sale.json',
            'houston_lease.json',
            'la_sale.json',
            'la_lease.json',
            'ny_sale.json',
            'ny_lease.json',
            'philadelphia_sale.json',
            'philadelphia_lease.json',
            'phoenix_sale.json',
            'phoenix_lease.json'
          ];

          for (const file of knownFiles) {
            if (file.includes(folder)) {
              try {
                const response = await fetch(`/residential/${folder}/${file}`);
                if (response.ok) {
                  const data = await response.json();
                  const properties = Array.isArray(data) ? data : data.properties || data.results || [];
                  
                  // Load MORE properties (not just 500)
                  properties.slice(0, 2000).forEach((p: PropertyData) => {
                    const addr = p.address as AddressObject | undefined;
                    allData.push({
                      ...p,
                      streetAddress: p.streetAddress || addr?.streetAddress,
                      city: p.city || addr?.city,
                      state: p.state || addr?.state,
                      zip: p.zip || addr?.zipcode,
                      dataSource: 'residential',
                      listingType: folder
                    });
                  });
                  loadedFiles++;
                  console.log(`✅ Loaded ${Math.min(properties.length, 2000)} properties from ${file}`);
                }
              } catch (e) {
                console.log(`❌ Failed to load ${file}`);
              }
            }
          }
        } catch (e) {
          console.log(`❌ Failed to load ${folder} folder`);
        }
      }

      // Calculate detailed statistics
      const commercialCount = allData.filter(p => p.dataSource === 'commercial').length;
      const residentialCount = allData.filter(p => p.dataSource === 'residential').length;
      const saleCount = allData.filter(p => p.listingType === 'sale' || p.status === 'ForSale').length;
      const leaseCount = allData.filter(p => p.listingType === 'lease' || p.status === 'ForLease').length;

      setAllPropertyData(allData);
      setDatasetStats({
        commercial: commercialCount,
        residential: residentialCount
      });

      console.log('🎉 AI Training Complete!');
      console.log(`📊 Total Properties: ${allData.length.toLocaleString()}`);
      console.log(`🏢 Commercial: ${commercialCount.toLocaleString()}`);
      console.log(`🏠 Residential: ${residentialCount.toLocaleString()}`);
      console.log(`💰 For Sale: ${saleCount.toLocaleString()}`);
      console.log(`📋 For Lease: ${leaseCount.toLocaleString()}`);
      console.log(`📁 Files Loaded: ${loadedFiles}`);
    };

    if (isOpen) {
      loadAllDatasets();
    }
  }, [isOpen]);

  // Scroll to bottom only if user is not manually scrolling
  useEffect(() => {
    if (!userScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolling]);

  // Detect user scrolling
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // If user scrolls up, disable auto-scroll
    // If user scrolls to bottom, enable auto-scroll
    setUserScrolling(!isAtBottom);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Find relevant properties - ENHANCED with better scoring and "top N" support
  const findRelevantProperties = (query: string): PropertyData[] => {
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 2);
    
    // Extract "top N" or "best N" number
    const topNMatch = queryLower.match(/\b(top|best|first|show me)\s+(\d+)\b/);
    const requestedCount = topNMatch ? parseInt(topNMatch[2]) : 5;
    
    const scored = allPropertyData.map(property => {
      let score = 0;
      
      const addr = property.address;
      const streetAddr = property.streetAddress || (typeof addr === 'object' ? addr?.streetAddress : '');
      const fullAddress = typeof addr === 'string' 
        ? addr.toLowerCase() 
        : `${streetAddr || ''} ${property.city || ''} ${property.state || ''}`.toLowerCase();
      
      const cityName = (property.city || '').toLowerCase();
      const stateName = (property.state || '').toLowerCase();
      const propType = (property.propertyType || property.homeType || '').toLowerCase();
      
      // City match - HIGH PRIORITY
      const cities = ['miami', 'chicago', 'houston', 'phoenix', 'philadelphia', 'new york', 'los angeles', 'san antonio', 'las vegas', 'austin', 'san francisco', 'sf'];
      cities.forEach(city => {
        if (queryLower.includes(city) && (cityName.includes(city) || fullAddress.includes(city))) {
          score += 100; // Increased from 50
        }
      });
      
      // Address match - SPECIFIC
      queryTokens.forEach(token => {
        if (fullAddress.includes(token)) score += 15;
        if (cityName.includes(token)) score += 20;
        if (stateName.includes(token)) score += 10;
        if (streetAddr && streetAddr.toLowerCase().includes(token)) score += 25;
      });
      
      // Property Type match - DETAILED
      const typeKeywords = {
        'office': ['office', 'offices'],
        'retail': ['retail', 'store', 'shop'],
        'industrial': ['industrial', 'warehouse', 'manufacturing'],
        'multifamily': ['multifamily', 'apartment', 'apartments'],
        'land': ['land', 'lot'],
        'hospitality': ['hotel', 'hospitality'],
        'home': ['home', 'house', 'single family'],
        'condo': ['condo', 'condominium'],
        'townhouse': ['townhouse', 'townhome']
      };
      
      Object.entries(typeKeywords).forEach(([type, keywords]) => {
        keywords.forEach(keyword => {
          if (queryLower.includes(keyword) && propType.includes(type)) {
            score += 40;
          }
        });
      });
      
      // Data source match
      if (queryLower.includes('commercial') && property.dataSource === 'commercial') score += 30;
      if (queryLower.includes('residential') && property.dataSource === 'residential') score += 30;
      
      // Listing type match
      if (queryLower.includes('sale') && (property.listingType === 'sale' || property.status === 'ForSale')) score += 25;
      if (queryLower.includes('lease') && (property.listingType === 'lease' || property.status === 'ForLease')) score += 25;
      if (queryLower.includes('rent') && (property.listingType === 'lease' || property.status === 'ForLease')) score += 25;
      
      // Price range match
      if (queryLower.includes('cheap') || queryLower.includes('affordable')) {
        const price = Number(property.price || property.priceNumeric || 0);
        if (price > 0 && price < 500000) score += 15;
      }
      if (queryLower.includes('luxury') || queryLower.includes('expensive')) {
        const price = Number(property.price || property.priceNumeric || 0);
        if (price > 1000000) score += 15;
      }
      
      // Boost for complete properties
      if (property.images?.length || property.imgSrc) score += 8;
      if (property.price || property.priceNumeric) score += 8;
      if (property.description) score += 5;
      if (streetAddr) score += 10;
      
      // Cap rate boost (if query mentions cap rate)
      if (queryLower.includes('cap rate') || queryLower.includes('caprate')) {
        if (property.capRate && property.capRate !== '' && property.capRate !== null) {
          score += 50; // High boost for properties with cap rates
        }
      }
      
      return { property, score };
    });

    return scored
      .filter(s => s.score > 15) // Slightly higher threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, requestedCount) // Use requested count instead of fixed 5
      .map(s => s.property);
  };

  // Generate property response
  const generatePropertyResponse = (properties: PropertyData[], query: string): string => {
    if (properties.length === 0) {
      const lowerQuery = query.toLowerCase();
      let suggestion = '';
      
      if (lowerQuery.includes('commercial')) {
        suggestion = '\n\n💡 **Try**: "Find offices in Miami" or "Show retail in Chicago"';
      } else if (lowerQuery.includes('residential') || lowerQuery.includes('home')) {
        suggestion = '\n\n💡 **Try**: "Show homes in Miami Beach" or "Find apartments in Chicago"';
      } else {
        suggestion = '\n\n💡 **Available cities**: Miami, Chicago, Houston, LA, New York, Philadelphia, Phoenix, Seattle, Boston';
      }
      
      return `I couldn't find properties matching "${query}".${suggestion}\n\nOr ask me: "What cities do you have?" or "How do I search?"`;
    }

    const isCommercial = properties[0]?.dataSource === 'commercial';
    const propertyType = isCommercial ? 'commercial' : 'residential';
    
    let response = `✨ Found **${properties.length} ${propertyType} properties** for you:\n\n`;
    
    properties.forEach((p, i) => {
      const addr = typeof p.address === 'string' 
        ? p.address 
        : `${p.streetAddress || p.address?.streetAddress || ''}, ${p.city || p.address?.city || ''}, ${p.state || p.address?.state || ''}`;
      
      const price = p.price || p.priceNumeric;
      const priceStr = price ? `$${Number(price).toLocaleString()}` : 'Contact for price';
      
      response += `**${i + 1}. ${addr.trim() || 'Address available on site'}**\n`;
      response += `   💰 ${priceStr}`;
      
      if (p.dataSource === 'residential') {
        if (p.bedrooms) response += ` | 🛏️ ${p.bedrooms} bed`;
        if (p.bathrooms) response += ` | 🛁 ${p.bathrooms} bath`;
        if (p.livingArea) response += ` | 📐 ${p.livingArea} sqft`;
        if (p.homeType) response += ` | 🏠 ${p.homeType}`;
      } else {
        if (p.propertyType) response += ` | 🏢 ${p.propertyType}`;
        if (p.squareFootage || p.buildingSize) response += ` | 📐 ${p.squareFootage || p.buildingSize}`;
        if (p.listingType) response += ` | 📋 ${p.listingType}`;
        if (p.capRate) response += ` | 📊 Cap Rate: ${p.capRate}`;
      }
      response += '\n\n';
    });

    response += `\n💡 **Tip**: Visit the **${isCommercial ? 'Commercial' : 'Residential'} Search** page to see all properties on the map and use filters!`;

    return response;
  };

  // Streaming text effect - types out message character by character with abort support
  const streamText = async (text: string) => {
    setIsStreaming(true);
    setStreamingMessage('');
    setIsAborted(false);
    isAbortedRef.current = false; // Reset ref
    
    // Add empty message placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    const chars = text.split('');
    let abortCheckCounter = 0;
    
    for (let i = 0; i < chars.length; i++) {
      // Check abort flag using ref (immediate check)
      abortCheckCounter++;
      if (isAbortedRef.current) {
        console.log(`⏹️ Streaming aborted at character ${i}/${chars.length} (${abortCheckCounter} checks)`);
        setIsStreaming(false);
        setStreamingMessage('');
        return; // Exit immediately
      }
      
      await new Promise(resolve => setTimeout(resolve, 15)); // 15ms per character
      
      // Double-check abort after delay using ref
      if (isAbortedRef.current) {
        console.log(`⏹️ Streaming aborted after delay at ${i}/${chars.length}`);
        setIsStreaming(false);
        setStreamingMessage('');
        return; // Exit immediately
      }
      
      setStreamingMessage(prev => prev + chars[i]);
      
      // Update the last message in real-time
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'assistant', 
          content: text.substring(0, i + 1) 
        };
        return newMessages;
      });
    }
    
    setIsStreaming(false);
    setStreamingMessage('');
  };

  // Stop/Abort AI response - IMPROVED WITH REF
  const stopAIResponse = useCallback(() => {
    console.log('🛑 STOP button clicked - Initiating abort sequence');
    
    // Set ref immediately (synchronous, no delay)
    isAbortedRef.current = true;
    setIsAborted(true);
    console.log('✅ Abort flag set (ref + state)');
    
    // Immediately stop all UI loading states
    setIsStreaming(false);
    setLoading(false);
    setIsSearching(false);
    setStreamingMessage('');
    
    // Abort ongoing API request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
        console.log('✅ API request aborted');
      } catch (error) {
        console.error('Abort error:', error);
      }
      abortControllerRef.current = null;
    }
    
    console.log('🎯 Abort sequence complete!');
  }, []);

  // Generate intelligent response based on query type
  const generateIntelligentResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Casual greetings - be friendly and natural!
    if (lowerQuery.match(/^(hi|hey|hello|sup|yo|greetings?)$/)) {
      return `Hey there! 👋 I'm doing great, thanks for asking!\n\nI'm here to help you explore our real estate platform. Whether you're looking for a new home or commercial space, I've got you covered!\n\nWhat brings you here today? 😊`;
    }
    
    if (lowerQuery.includes('how are you') || lowerQuery.includes('how r u') || lowerQuery.includes('whats up') || lowerQuery.includes("what's up")) {
      return `I'm doing awesome! 😊 Thanks for asking!\n\nI'm excited to help you find properties or answer any questions about our platform. We've got thousands of commercial and residential properties across major cities!\n\nWhat can I help you with today?`;
    }
    
    if (lowerQuery.includes('good morning')) {
      return `Good morning! ☀️ Hope you're having a great day!\n\nReady to explore some properties? I can help you find homes, offices, retail spaces, and more across Miami, Chicago, Houston, and other cities.\n\nWhat are you looking for?`;
    }
    
    if (lowerQuery.includes('good afternoon')) {
      return `Good afternoon! 🌤️\n\nPerfect time to browse some properties! Whether you need commercial or residential, I'm here to help you find exactly what you're looking for.\n\nWant to start with a city search?`;
    }
    
    if (lowerQuery.includes('good evening') || lowerQuery.includes('good night')) {
      return `Good evening! 🌙\n\nGreat time to explore properties! I can help you search through our extensive database of commercial and residential listings.\n\nWhat would you like to find?`;
    }
    
    // Site navigation questions
    if (lowerQuery.includes('how') && (lowerQuery.includes('search') || lowerQuery.includes('find') || lowerQuery.includes('use'))) {
      return `**How to Search for Properties:**\n\n1️⃣ **Hero Search**: Use the search bar on the homepage - type a city name\n2️⃣ **Commercial Search**: Click "Commercial" in navigation → Filter by type, price\n3️⃣ **Residential Search**: Click "Residential" → Filter by beds, baths, price\n4️⃣ **Map View**: Click pins to see details, click again to view full property\n\n💡 **Tip**: All filters persist in URL - you can bookmark or share your search!`;
    }
    
    // How to use the site
    if (lowerQuery.includes('how') && (lowerQuery.includes('use') || lowerQuery.includes('navigate') || lowerQuery.includes('work'))) {
      return `**How to Use This Platform:**\n\n**🔍 Searching:**\n• Use the search bar on homepage to find properties by city\n• Visit Commercial or Residential pages for advanced search\n• Use filters to narrow down results\n\n**🗺️ Maps:**\n• Properties are shown as pins on the map\n• Click a pin to see property details\n• Click again to view the full property page\n• Zoom and pan to explore different areas\n\n**💾 Saving & Sharing:**\n• All filters save in the URL\n• Bookmark your search results\n• Share links with others\n\n**📱 Mobile:**\n• Fully optimized for mobile devices\n• Touch-friendly interface\n• All features work on phones and tablets\n\nNeed help with something specific? Just ask!`;
    }
    
    if (lowerQuery.includes('filter') || lowerQuery.includes('narrow')) {
      return `**Available Filters:**\n\n**Commercial Properties:**\n• Listing Type (Sale/Lease)\n• Property Type (Office, Retail, Industrial, etc.)\n• Price Range\n\n**Residential Properties:**\n• Price Range\n• Bedrooms (1+, 2+, 3+, 4+)\n• Bathrooms (1+, 2+, 3+)\n\n✨ Filters update instantly and save in URL!`;
    }
    
    if (lowerQuery.includes('map') || lowerQuery.includes('location')) {
      return `**Interactive Map Features:**\n\n📍 **Property Pins**: Each property shown on map\n🔵 **Clusters**: Groups of properties (click to zoom)\n💬 **Popups**: Hover over pins for quick details\n🖱️ **Click**: Click pin again to view full property page\n🗺️ **Pan & Zoom**: Explore different areas\n\n**Available on both Commercial and Residential search pages!**`;
    }
    
    if (lowerQuery.includes('dataset') || lowerQuery.includes('cities') || lowerQuery.includes('where') || lowerQuery.includes('how many')) {
      const totalProps = allPropertyData.length;
      const saleProps = allPropertyData.filter(p => p.listingType === 'sale' || p.status === 'ForSale').length;
      const leaseProps = allPropertyData.filter(p => p.listingType === 'lease' || p.status === 'ForLease').length;
      const cities = [...new Set(allPropertyData.map(p => p.city).filter(Boolean))];
      
      return `**Complete Property Database:**\n\n**📊 Total Properties: ${totalProps.toLocaleString()}**\n\n**By Category:**\n🏢 Commercial: ${datasetStats.commercial.toLocaleString()}\n🏠 Residential: ${datasetStats.residential.toLocaleString()}\n💰 For Sale: ${saleProps.toLocaleString()}\n📋 For Lease: ${leaseProps.toLocaleString()}\n\n**Cities (${cities.length} total):**\n${cities.slice(0, 12).join(', ')}${cities.length > 12 ? ', and more!' : ''}\n\n**I have access to comprehensive property data across:**\n✅ Commercial properties (offices, retail, industrial, multifamily, etc.)\n✅ Residential properties (homes, condos, townhouses)\n✅ Multiple major cities across the US\n\n**I know every property's address, price, type, and details!** 🎯`;
    }
    
    if (lowerQuery.includes('type') && lowerQuery.includes('property')) {
      return `**Property Types Available:**\n\n**Commercial:**\n🏢 Office | 🏪 Retail | 🏭 Industrial\n🏘️ Multifamily | 🌳 Land | 🏨 Hospitality\n🏥 Healthcare | 🏙️ Mixed Use\n\n**Residential:**\n🏠 Single Family | 🏢 Condo\n🏘️ Townhouse | 🏘️ Multi-Family\n\nUse the **Type filter** on search pages to narrow down!`;
    }
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('what can') || lowerQuery.includes('what does')) {
      return `**Platform Features:**\n\n✨ **Smart Search**: Find properties by city, type, price\n🗺️ **Interactive Maps**: Visual property exploration with pins and clusters\n🎯 **Advanced Filters**: Narrow by beds, baths, type, price, listing type\n📱 **Mobile Optimized**: Works great on all devices\n🔗 **Shareable URLs**: All filters save in URL for easy sharing\n📊 **Property Details**: Full specs, images, location, pricing\n🏢 **Dual Markets**: Both commercial & residential properties\n💰 **Cap Rate Data**: View cap rates for commercial properties\n🔖 **Favorites**: Save properties you like\n📧 **Contact**: Easy contact options for each property\n\nTry searching for a city to see it in action!`;
    }
    
    // Property type questions
    if (lowerQuery.includes('what type') || lowerQuery.includes('what kind') || (lowerQuery.includes('property') && lowerQuery.includes('type'))) {
      return `**Property Types Available:**\n\n**🏢 Commercial:**\n• Office Spaces\n• Retail Stores\n• Industrial/Warehouse\n• Multifamily Buildings\n• Land/Lots\n• Hospitality (Hotels)\n• Healthcare Facilities\n• Mixed Use Properties\n• Flex Spaces\n• Coworking Spaces\n\n**🏠 Residential:**\n• Single Family Homes\n• Condos/Condominiums\n• Townhouses\n• Multi-Family Homes\n• Apartments\n\nUse the **Property Type filter** on search pages to find exactly what you need!`;
    }
    
    // Price questions
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('expensive') || lowerQuery.includes('affordable') || lowerQuery.includes('cheap')) {
      const totalProps = allPropertyData.length;
      const withPrice = allPropertyData.filter(p => p.price || p.priceNumeric).length;
      const commercialWithPrice = allPropertyData.filter(p => (p.dataSource === 'commercial') && (p.price || p.priceNumeric)).length;
      const residentialWithPrice = allPropertyData.filter(p => (p.dataSource === 'residential') && (p.price || p.priceNumeric)).length;
      
      return `**Pricing Information:**\n\n**Properties with Pricing:**\n📊 ${withPrice.toLocaleString()} out of ${totalProps.toLocaleString()} properties have pricing information\n🏢 Commercial: ${commercialWithPrice.toLocaleString()} properties\n🏠 Residential: ${residentialWithPrice.toLocaleString()} properties\n\n**Price Filters Available:**\n• Under $500K\n• $500K - $1M\n• $1M - $5M\n• $5M - $10M\n• $10M - $50M\n• $50M+\n\n**💡 Tips:**\n• Use price filters on search pages to narrow results\n• Property prices vary by location, type, and size\n• Some properties may show "Contact for price"\n• Commercial properties often include cap rate data\n\nWant to see properties in a specific price range? Just ask!`;
    }
    
    // Location/City questions
    if (lowerQuery.includes('where') || lowerQuery.includes('location') || (lowerQuery.includes('city') && !lowerQuery.includes('cities'))) {
      const cities = [...new Set(allPropertyData.map(p => p.city).filter(Boolean))];
      const topCities = cities.slice(0, 10);
      
      return `**Available Locations:**\n\n**Major Cities (${cities.length} total):**\n${topCities.join(', ')}${cities.length > 10 ? ', and more!' : ''}\n\n**💡 How to Search by Location:**\n1. Type a city name in the homepage search bar\n2. Or visit Commercial/Residential search pages\n3. Use location filters when available\n\n**🗺️ Map Features:**\n• All properties are shown on interactive maps\n• Click pins to see property details\n• Explore different neighborhoods and areas\n\nLooking for properties in a specific city? Just tell me which one!`;
    }
    
    // Thank you responses
    if (lowerQuery.includes('thank') || lowerQuery.includes('thx') || lowerQuery.includes('ty')) {
      return `You're very welcome! 😊\n\nHappy to help anytime! If you need anything else - whether it's finding properties or learning about features - just let me know!\n\nGood luck with your property search! 🏡`;
    }
    
    // Goodbye responses
    if (lowerQuery.match(/^(bye|goodbye|see you|later|cya)$/)) {
      return `Goodbye! 👋 It was great chatting with you!\n\nFeel free to come back anytime you need help finding properties. Have a wonderful day! 😊`;
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return `**I can help you with:**\n\n🔍 **Property Search**: "Find offices in Miami" or "Top 3 properties in Miami"\n📍 **Navigation**: "How do I search for properties?" or "How do I use the site?"\n🎯 **Filters**: "What filters are available?" or "How do filters work?"\n🗺️ **Maps**: "How does the map work?" or "How do I use the map?"\n📊 **Property Info**: "What cities do you have?" or "How many properties are there?"\n💡 **Features**: "What can this site do?" or "What features are available?"\n💰 **Cap Rates**: "What is the cap rate in Miami?" or "Show properties with cap rates"\n🏠 **Property Types**: "What types of properties do you have?"\n💵 **Pricing**: "What's the price range?" or "Show affordable properties"\n\nJust ask me anything about properties, the platform, or real estate in general!`;
    }
    
    // Cap rate questions
    if (lowerQuery.includes('cap rate') || lowerQuery.includes('caprate') || lowerQuery.includes('cap-rate')) {
      // Check if asking about specific location
      const miamiMatch = lowerQuery.includes('miami');
      const chicagoMatch = lowerQuery.includes('chicago');
      const houstonMatch = lowerQuery.includes('houston');
      const phoenixMatch = lowerQuery.includes('phoenix');
      const philadelphiaMatch = lowerQuery.includes('philadelphia');
      const nyMatch = lowerQuery.includes('new york') || lowerQuery.includes('nyc');
      const laMatch = lowerQuery.includes('los angeles') || lowerQuery.includes('la');
      const sfMatch = lowerQuery.includes('san francisco') || lowerQuery.includes('sf') || lowerQuery === 'san fran';
      const austinMatch = lowerQuery.includes('austin');
      
      const city = miamiMatch ? 'Miami' : chicagoMatch ? 'Chicago' : houstonMatch ? 'Houston' : 
                   phoenixMatch ? 'Phoenix' : philadelphiaMatch ? 'Philadelphia' : nyMatch ? 'New York' : 
                   laMatch ? 'Los Angeles' : sfMatch ? 'San Francisco' : austinMatch ? 'Austin' : null;
      
      // Find properties with cap rates in the specified city
      const propertiesWithCapRate = allPropertyData.filter(p => {
        const hasCapRate = p.capRate && p.capRate !== '' && p.capRate !== null;
        if (!hasCapRate) return false;
        if (city) {
          const cityLower = city.toLowerCase();
          const propCity = (p.city || '').toLowerCase();
          return propCity.includes(cityLower) || cityLower.includes(propCity);
        }
        return true;
      });
      
      if (propertiesWithCapRate.length > 0) {
        // Calculate average cap rate
        const capRates = propertiesWithCapRate
          .map(p => {
            const capRateStr = p.capRate || '';
            const match = capRateStr.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : null;
          })
          .filter((r): r is number => r !== null);
        
        const avgCapRate = capRates.length > 0 
          ? (capRates.reduce((a, b) => a + b, 0) / capRates.length).toFixed(2)
          : 'N/A';
        
        const minCapRate = capRates.length > 0 ? Math.min(...capRates).toFixed(2) : 'N/A';
        const maxCapRate = capRates.length > 0 ? Math.max(...capRates).toFixed(2) : 'N/A';
        
        let response = `**Cap Rate Information${city ? ` for ${city}` : ''}:**\n\n`;
        response += `📊 **Properties with Cap Rates**: ${propertiesWithCapRate.length.toLocaleString()}\n`;
        response += `📈 **Average Cap Rate**: ${avgCapRate}%\n`;
        response += `📉 **Range**: ${minCapRate}% - ${maxCapRate}%\n\n`;
        response += `**What is Cap Rate?**\n`;
        response += `Cap Rate (Capitalization Rate) is a key metric for commercial real estate investment. It's calculated as:\n\n`;
        response += `**Cap Rate = Net Operating Income (NOI) / Property Value**\n\n`;
        response += `💡 **Interpretation:**\n`;
        response += `• Higher cap rate = Higher potential return (but may indicate higher risk)\n`;
        response += `• Lower cap rate = Lower return (but may indicate more stable/valuable property)\n`;
        response += `• Typical range: 4-10% for commercial properties\n\n`;
        
        if (city) {
          response += `Would you like me to show you specific properties in ${city} with their cap rates?`;
        } else {
          response += `Would you like me to search for properties with cap rates in a specific city?`;
        }
        
        return response;
      } else {
        return `I don't have cap rate data${city ? ` for ${city}` : ''} in the current dataset.\n\n**What is Cap Rate?**\n\nCap Rate (Capitalization Rate) measures the return on a commercial real estate investment:\n\n**Cap Rate = Net Operating Income (NOI) / Property Value**\n\n💡 **Typical Range**: 4-10% for commercial properties\n\nWould you like me to search for properties in a specific city?`;
      }
    }
    
    // Fun/casual responses
    if (lowerQuery.includes('cool') || lowerQuery.includes('awesome') || lowerQuery.includes('nice')) {
      return `Thanks! 😄 I try my best!\n\nSo, ready to find some amazing properties? I've got commercial and residential listings across multiple cities. Just tell me what you're looking for!`;
    }
    
    if (lowerQuery.includes('lol') || lowerQuery.includes('haha') || lowerQuery.includes('funny')) {
      return `😄 Glad I could make you smile!\n\nNow, let's get down to business - what kind of property are you interested in? Office space? A new home? Retail location?`;
    }
    
    if (lowerQuery.includes('boring') || lowerQuery.includes('not helpful')) {
      return `Oh no! 😅 I'm sorry if I wasn't helpful!\n\nLet me try again - what specifically are you looking for? I can search properties, explain features, or just chat about real estate. What would be most useful for you?`;
    }
    
    // Who are you questions
    if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you')) {
      return `I'm your AI Real Estate Assistant! 🤖\n\nThink of me as your personal property guide. I know everything about this platform - all the cities, property types, how to search, use filters, and more!\n\nI'm here to make finding properties super easy for you. Want to give it a try?`;
    }
    
    if (lowerQuery.includes('your name') || lowerQuery.includes('called')) {
      return `I'm the AI Assistant for this real estate platform! 😊\n\nYou can just call me "Assistant" or "AI" - I'm not picky! My job is to help you navigate the site and find amazing properties.\n\nWhat can I help you discover today?`;
    }
    
    // Default conversational response
    return `I'd be happy to help! 😊\n\nI'm here to assist with:\n• **Finding properties** (try: "Show me homes in Miami" or "Top 3 properties in Miami")\n• **Cap Rate Questions** (ask: "What is the cap rate in Miami?")\n• **Explaining features** (ask: "How do filters work?" or "What can this site do?")\n• **Site navigation** (ask: "How do I search?" or "How do I use the map?")\n• **Property information** (ask: "What cities are available?" or "What types of properties do you have?")\n• **Real estate questions** (ask me anything about properties, pricing, locations, etc.)\n\nWhat would you like to know?`;
  };

  // Simple spell correction for common real estate terms
  const correctCommonTypos = (text: string): string => {
    const corrections: Record<string, string> = {
      // Cities
      'miam': 'miami',
      'miama': 'miami',
      'chicgo': 'chicago',
      'huston': 'houston',
      'phoenx': 'phoenix',
      'phoenex': 'phoenix',
      'philadelpha': 'philadelphia',
      'philidelphia': 'philadelphia',
      'philly': 'philadelphia',
      'ny': 'new york',
      'nyc': 'new york',
      'la': 'los angeles',
      'sf': 'san francisco',
      'san fran': 'san francisco',
      'san antonio': 'san antonio',
      // Property terms
      'propert': 'property',
      'propertys': 'properties',
      'propertie': 'properties',
      'offce': 'office',
      'retial': 'retail',
      'industrail': 'industrial',
      'industial': 'industrial',
      'multifamly': 'multifamily',
      'multifamliy': 'multifamily',
      'townhome': 'townhouse',
      // Cap rate variations
      'caprate': 'cap rate',
      'cap-rate': 'cap rate',
      'caprat': 'cap rate',
      'cap rat': 'cap rate',
      // Common words
      'seach': 'search',
      'serch': 'search',
      'fidn': 'find',
      'fnd': 'find',
      'shw': 'show',
      'shwo': 'show',
    };
    
    let corrected = text;
    // Apply corrections case-insensitively but preserve original case structure
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, (match) => {
        // Preserve original case
        if (match === match.toUpperCase()) {
          return correct.toUpperCase();
        } else if (match[0] === match[0].toUpperCase()) {
          return correct.charAt(0).toUpperCase() + correct.slice(1);
        }
        return correct;
      });
    });
    
    return corrected;
  };

  // Send message with AI API integration
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Apply spell correction before sending
    const correctedInput = spellCheckEnabled ? correctCommonTypos(input.trim()) : input.trim();
    const userMessage = correctedInput;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Check if property search query - EXPANDED to handle more query patterns
    const propertySearchKeywords = ['find', 'show', 'search', 'looking for', 'want', 'need', 'list', 'tell me', 'let me know', 'top', 'best', 'properties', 'property'];
    const locationKeywords = ['miami', 'chicago', 'houston', 'phoenix', 'philadelphia', 'new york', 'nyc', 'la', 'los angeles', 'san antonio', 'manhattan', 'brooklyn', 'las vegas', 'vegas', 'austin', 'san francisco', 'sf', 'san fran'];
    const propertyTypeKeywords = ['home', 'house', 'office', 'retail', 'industrial', 'apartment', 'condo', 'commercial', 'residential'];
    
    const lowerMsg = userMessage.toLowerCase();
    // Check for property-related queries (expanded patterns)
    const hasLocation = locationKeywords.some(k => lowerMsg.includes(k));
    const hasPropertyType = propertyTypeKeywords.some(k => lowerMsg.includes(k));
    const hasSearchKeyword = propertySearchKeywords.some(k => lowerMsg.includes(k));
    const hasNumberQuery = /\b(top|best|first|show me)\s+\d+\b/.test(lowerMsg);
    const isPropertySearch = (hasSearchKeyword || hasNumberQuery) && (hasLocation || hasPropertyType || lowerMsg.includes('properties') || lowerMsg.includes('property'));

    if (isPropertySearch && allPropertyData.length > 0) {
      setIsSearching(true);
      
      setTimeout(async () => {
        // Check if aborted during search delay using ref
        if (isAbortedRef.current) {
          console.log('⏹️ Property search aborted during delay');
          setIsSearching(false);
          setLoading(false);
          return;
        }
        
        const results = findRelevantProperties(userMessage);
        
        // Check if aborted after search using ref
        if (isAbortedRef.current) {
          console.log('⏹️ Property search aborted after finding results');
          setIsSearching(false);
          setLoading(false);
          return;
        }
        
        const response = generatePropertyResponse(results, userMessage);
        
        setIsSearching(false);
        setLoading(false);
        
        // Final check before streaming using ref
        if (isAbortedRef.current) {
          console.log('⏹️ Property search aborted before streaming');
          return;
        }
        
        await streamText(response);
      }, 800);
    } else {
      // Use AI API for intelligent conversational responses
      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();
        // Calculate comprehensive property statistics
        const totalProperties = allPropertyData.length;
        const commercialProps = allPropertyData.filter(p => p.dataSource === 'commercial');
        const residentialProps = allPropertyData.filter(p => p.dataSource === 'residential');
        const saleProps = allPropertyData.filter(p => p.listingType === 'sale' || p.status === 'ForSale');
        const leaseProps = allPropertyData.filter(p => p.listingType === 'lease' || p.status === 'ForLease');
        
        // Get unique cities
        const cities = [...new Set(allPropertyData.map(p => p.city).filter(Boolean))];
        
        // Get property type counts
        const propertyTypes = allPropertyData.reduce((acc, p) => {
          const type = p.propertyType || p.homeType || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Build system prompt with COMPLETE site knowledge and property data
        const systemPrompt = `You are a friendly, helpful AI Real Estate Assistant for a comprehensive real estate platform. You have been trained on ALL property data in the system.

**🏢 YOUR COMPLETE PROPERTY KNOWLEDGE:**

**Total Properties in Database: ${totalProperties.toLocaleString()}**
- Commercial Properties: ${commercialProps.length.toLocaleString()}
- Residential Properties: ${residentialProps.length.toLocaleString()}
- For Sale: ${saleProps.length.toLocaleString()}
- For Lease: ${leaseProps.length.toLocaleString()}

**Cities Available (${cities.length} total):**
${cities.slice(0, 15).join(', ')}${cities.length > 15 ? ', and more' : ''}

**Property Types You Know:**
Commercial: Office, Retail, Industrial, Multifamily, Land, Hospitality, Healthcare, Mixed Use, Flex Space, Coworking
Residential: Single Family, Condo, Townhouse, Multi-Family, Apartment

**Commercial Property Metrics:**
- Cap Rate (Capitalization Rate): Available for many commercial properties. Formula: NOI / Property Value. Typical range: 4-10%
- Square Footage / Building Size
- Number of Units
- Price per Square Foot

**Data Coverage:**
- Commercial properties: Miami, Chicago, Houston, LA, New York, Philadelphia, Phoenix, San Antonio, Seattle, Boston, Las Vegas, and more
- Residential properties: Sale and Lease listings across major cities
- Comprehensive property data with full details, images, and location information

**What You Can Do:**
1. Search properties by city, type, price, size
2. Provide exact property counts for any category
3. Know property addresses, prices, details
4. Sort and filter properties by any criteria
5. Answer questions about specific properties
6. Explain platform features and navigation
7. Answer questions about cap rates and provide cap rate statistics
8. Find "top N" or "best N" properties in any city

**Platform Features:**
- Advanced search with filters (location, type, price, beds, baths)
- Interactive maps with property pins and clusters
- Filter persistence in URLs for easy sharing
- Mobile-optimized design
- Commercial search: /commercial-search (Listing Type, Property Type, Price filters)
- Residential search: /unified-search (Price, Bedrooms, Bathrooms filters)

**Your Personality:**
- Friendly, casual, and conversational (like ChatGPT)
- Use emojis appropriately 😊
- Be enthusiastic and knowledgeable about real estate
- Provide specific numbers and details when asked
- Keep responses helpful and actionable

**Guidelines:**
- When users ask about property counts, give EXACT numbers
- For property searches, tell them you'll search the database
- For questions about specific cities/types, reference your knowledge
- For site questions, explain features clearly
- For casual chat, be warm and friendly
- Always offer to help further
- Use bold text with ** for emphasis
- If asked about addresses, confirm you have access to all property addresses
- NEVER mention specific dataset file names, JSON files, or technical implementation details
- Focus on what the platform can do, not how it's built
- Be helpful and conversational about real estate topics

**Example Responses:**
- "How many properties?" → "We have ${totalProperties.toLocaleString()} total properties!"
- "Properties in Miami?" → "I have access to thousands of Miami properties across commercial and residential!"
- "What types?" → List specific types with counts if possible
- "How do I search?" → Explain the search process clearly
- "What features do you have?" → List platform features
- "What's the price range?" → Provide pricing information

Respond naturally, helpfully, and with specific details from your training data.`;

        const apiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ];

        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            max_tokens: 500,
            temperature: 0.8,
            stream: false
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error('AI API request failed');
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || generateIntelligentResponse(userMessage);
        
        setLoading(false);
        abortControllerRef.current = null;
        await streamText(aiResponse);
      } catch (error: any) {
        // Check if it was aborted by user
        if (error.name === 'AbortError') {
          console.log('⏹️ Request aborted by user');
          setLoading(false);
          return;
        }
        
        console.error('AI API Error:', error);
        // Fallback to hardcoded responses if API fails
        setLoading(false);
        abortControllerRef.current = null;
        const response = generateIntelligentResponse(userMessage);
        await streamText(response);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed z-[9999] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden ${isDragging ? 'select-none' : ''} 
        w-[90vw] max-w-[380px] h-[70vh] max-h-[500px] 
        md:w-[380px] md:h-[500px]`}
      style={{
        left: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : position.x,
        top: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : position.y,
        transform: typeof window !== 'undefined' && window.innerWidth < 768 ? 'translate(-50%, -50%)' : 'none',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Draggable Header */}
      <div 
        className="bg-accent-yellow px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move size={16} className="text-primary-black/40" />
          <User size={18} className="text-primary-black" />
          <h3 className="font-bold text-sm text-primary-black">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="text-primary-black hover:bg-yellow-400 rounded-full p-1.5 transition-colors"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm text-sm ${
                message.role === 'user'
                  ? 'bg-accent-yellow text-primary-black'
                  : 'bg-white text-primary-black border border-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.role === 'assistant' 
                  ? formatMessageContent(message.content)
                  : message.content
                }
                {/* Blinking cursor for streaming message */}
                {message.role === 'assistant' && isStreaming && index === messages.length - 1 && (
                  <span className="inline-block w-1.5 h-4 bg-accent-yellow ml-0.5 animate-pulse" />
                )}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {(loading || isSearching) && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-accent-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-accent-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">
                  {isSearching ? 'Searching properties...' : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={spellCheckEnabled}
            autoCorrect={spellCheckEnabled ? 'on' : 'off'}
            autoCapitalize="sentences"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                sendMessage();
                // Force zoom out on mobile after submit
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  const viewport = document.querySelector('meta[name="viewport"]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    setTimeout(() => {
                      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    }, 100);
                  }
                  // Blur input to dismiss keyboard
                  (e.target as HTMLInputElement).blur();
                }
              }
            }}
            onBlur={() => {
              // Ensure zoom out when input loses focus
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
              }
            }}
            placeholder="Ask about properties..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
            disabled={loading || isStreaming}
            style={{ fontSize: '16px' }}
            title={spellCheckEnabled ? 'Spell check enabled - Common typos will be auto-corrected' : 'Spell check disabled'}
          />
          
          {/* Abort Button - Shows when AI is processing, next to Send button */}
          {(loading || isStreaming || isSearching) ? (
            <button
              onClick={stopAIResponse}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md flex items-center gap-1.5"
              title="Stop Response (4-Layer Abort)"
            >
              <StopCircle size={18} />
              <span className="text-sm font-medium">Stop</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sendMessage();
                // Force zoom out on mobile after submit
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  const viewport = document.querySelector('meta[name="viewport"]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    setTimeout(() => {
                      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    }, 100);
                  }
                  // Blur input to dismiss keyboard
                  const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (inputElement) inputElement.blur();
                }
              }}
              disabled={!input.trim()}
              className="px-3 py-2 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
        {/* Spell Check Toggle */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={spellCheckEnabled}
              onChange={(e) => setSpellCheckEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow cursor-pointer"
            />
            <span>Spell Check</span>
          </label>
          {spellCheckEnabled && (
            <span className="text-xs text-gray-500">Auto-corrects common typos</span>
          )}
        </div>
      </div>
    </div>
  );
}

