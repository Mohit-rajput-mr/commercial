'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, User, Move, Minimize2 } from 'lucide-react';

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

export default function DraggableAIChat({ isOpen, onClose }: DraggableAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI real estate assistant. I can help you find **commercial** and **residential** properties! 🏢🏠\n\nTry asking: "Show me homes in Miami Beach" or "Find offices in Chicago"!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allPropertyData, setAllPropertyData] = useState<PropertyData[]>([]);
  const [datasetStats, setDatasetStats] = useState({ commercial: 0, residential: 0 });
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
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

  // Load all property datasets
  useEffect(() => {
    const loadAllDatasets = async () => {
      const allData: PropertyData[] = [];
      
      // Commercial files
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
        'dataset_son_antonio_lease.json'
      ];

      // Load commercial
      for (const file of commercialFiles) {
        try {
          const response = await fetch(`/commercial/${file}`);
          if (response.ok) {
            const data = await response.json();
            const properties = Array.isArray(data) ? data : data.properties || [];
            properties.forEach((p: PropertyData) => {
              allData.push({ ...p, dataSource: 'commercial' });
            });
          }
        } catch (e) {
          console.log(`Failed to load ${file}`);
        }
      }

      // Residential folders and files
      const residentialFolders = ['lease', 'sale'];
      for (const folder of residentialFolders) {
        try {
          const indexResponse = await fetch(`/residential/${folder}/`);
          if (indexResponse.ok) {
            const text = await indexResponse.text();
            const jsonFiles = text.match(/[\w-]+\.json/g) || [];
            
            for (const file of jsonFiles.slice(0, 3)) {
              try {
                const response = await fetch(`/residential/${folder}/${file}`);
                if (response.ok) {
                  const data = await response.json();
                  const properties = Array.isArray(data) ? data : data.properties || data.results || [];
                  properties.slice(0, 500).forEach((p: PropertyData) => {
                    const addr = p.address as AddressObject | undefined;
                    allData.push({
                      ...p,
                      streetAddress: p.streetAddress || addr?.streetAddress,
                      city: p.city || addr?.city,
                      state: p.state || addr?.state,
                      zip: p.zip || addr?.zipcode,
                      dataSource: 'residential'
                    });
                  });
                }
              } catch (e) {
                console.log(`Failed to load ${file}`);
              }
            }
          }
        } catch (e) {
          console.log(`Failed to load ${folder} folder`);
        }
      }

      setAllPropertyData(allData);
      setDatasetStats({
        commercial: allData.filter(p => p.dataSource === 'commercial').length,
        residential: allData.filter(p => p.dataSource === 'residential').length
      });
    };

    if (isOpen) {
      loadAllDatasets();
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Find relevant properties
  const findRelevantProperties = (query: string): PropertyData[] => {
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 2);
    
    const scored = allPropertyData.map(property => {
      let score = 0;
      
      const addr = property.address;
      const fullAddress = typeof addr === 'string' 
        ? addr.toLowerCase() 
        : `${addr?.streetAddress || ''} ${addr?.city || ''} ${addr?.state || ''}`.toLowerCase();
      
      const cityName = (property.city || '').toLowerCase();
      const stateName = (property.state || '').toLowerCase();
      
      // City match
      if (queryLower.includes('miami') && (cityName.includes('miami') || fullAddress.includes('miami'))) score += 50;
      if (queryLower.includes('chicago') && (cityName.includes('chicago') || fullAddress.includes('chicago'))) score += 50;
      if (queryLower.includes('houston') && (cityName.includes('houston') || fullAddress.includes('houston'))) score += 50;
      if (queryLower.includes('phoenix') && (cityName.includes('phoenix') || fullAddress.includes('phoenix'))) score += 50;
      if (queryLower.includes('philadelphia') && (cityName.includes('philadelphia') || fullAddress.includes('philadelphia'))) score += 50;
      
      // Address match
      queryTokens.forEach(token => {
        if (fullAddress.includes(token)) score += 10;
        if (cityName.includes(token)) score += 15;
        if (stateName.includes(token)) score += 5;
      });
      
      // Type match
      if (queryLower.includes('commercial') && property.dataSource === 'commercial') score += 20;
      if (queryLower.includes('residential') && property.dataSource === 'residential') score += 20;
      if (queryLower.includes('home') && property.dataSource === 'residential') score += 15;
      if (queryLower.includes('office') && property.propertyType?.toLowerCase().includes('office')) score += 25;
      if (queryLower.includes('retail') && property.propertyType?.toLowerCase().includes('retail')) score += 25;
      
      // Boost for properties with images/price
      if (property.images?.length || property.imgSrc) score += 5;
      if (property.price || property.priceNumeric) score += 5;
      
      return { property, score };
    });

    return scored
      .filter(s => s.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.property);
  };

  // Generate property response
  const generatePropertyResponse = (properties: PropertyData[], query: string): string => {
    if (properties.length === 0) {
      return `I couldn't find properties matching "${query}". Try searching for a city like Miami Beach, Chicago, or Houston.`;
    }

    let response = `Found **${properties.length} properties** matching your search:\n\n`;
    
    properties.forEach((p, i) => {
      const addr = typeof p.address === 'string' 
        ? p.address 
        : `${p.streetAddress || p.address?.streetAddress || ''}, ${p.city || p.address?.city || ''}, ${p.state || p.address?.state || ''}`;
      
      const price = p.price || p.priceNumeric;
      const priceStr = price ? `$${Number(price).toLocaleString()}` : 'Price on request';
      
      response += `**${i + 1}. ${addr}**\n`;
      response += `   💰 ${priceStr}`;
      
      if (p.dataSource === 'residential') {
        if (p.bedrooms) response += ` | 🛏️ ${p.bedrooms} bed`;
        if (p.bathrooms) response += ` | 🛁 ${p.bathrooms} bath`;
        if (p.livingArea) response += ` | 📐 ${p.livingArea} sqft`;
      } else {
        if (p.propertyType) response += ` | 🏢 ${p.propertyType}`;
        if (p.squareFootage || p.buildingSize) response += ` | 📐 ${p.squareFootage || p.buildingSize}`;
      }
      response += '\n\n';
    });

    return response;
  };

  // Streaming text effect - types out message character by character
  const streamText = async (text: string) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    // Add empty message placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 15)); // 15ms per character
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

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Check if property query
    const propertyKeywords = ['find', 'show', 'search', 'property', 'properties', 'home', 'house', 'office', 'retail', 'commercial', 'residential', 'miami', 'chicago', 'houston', 'phoenix'];
    const isPropertyQuery = propertyKeywords.some(k => userMessage.toLowerCase().includes(k));

    if (isPropertyQuery && allPropertyData.length > 0) {
      setIsSearching(true);
      
      setTimeout(async () => {
        const results = findRelevantProperties(userMessage);
        const response = generatePropertyResponse(results, userMessage);
        
        setIsSearching(false);
        setLoading(false);
        await streamText(response);
      }, 800);
    } else {
      // Quick responses for non-property queries
      const quickResponses: Record<string, string> = {
        'hello': 'Hello! How can I help you find properties today?',
        'hi': 'Hi there! Looking for properties? Tell me a city or property type!',
        'help': 'I can help you find **commercial** and **residential** properties. Try: "Find homes in Miami Beach" or "Show offices in Chicago"',
        'thanks': 'You\'re welcome! Let me know if you need anything else.',
      };

      const lowerMsg = userMessage.toLowerCase();
      const quickResponse = Object.entries(quickResponses).find(([key]) => lowerMsg.includes(key));
      
      setLoading(false);
      
      if (quickResponse) {
        await streamText(quickResponse[1]);
      } else {
        await streamText('I specialize in property searches. Try asking about properties in a specific city!');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed z-[9999] w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden ${isDragging ? 'select-none' : ''}`}
      style={{
        left: position.x,
        top: position.y,
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
          {datasetStats.commercial + datasetStats.residential > 0 && (
            <span className="text-xs text-primary-black/60">
              ({(datasetStats.commercial + datasetStats.residential).toLocaleString()} properties)
            </span>
          )}
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
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
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about properties..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

