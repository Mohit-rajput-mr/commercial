'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';

const RAPIDAPI_KEY = 'faf657766emsha74fedf2f6947fdp14c2b1jsn61fd3e532c38';
const RAPIDAPI_HOST = 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com';
const CHATGPT_API_URL = `https://${RAPIDAPI_HOST}/v1/chat/completions`;

const SYSTEM_PROMPT = `You are an intelligent AI assistant for Cap Rate, the world's #1 commercial real estate marketplace. You have comprehensive knowledge about the entire platform, all its features, components, and how everything works. Your role is to help users navigate the platform, find properties, understand features, and answer any questions about the marketplace.

=== PLATFORM OVERVIEW ===
Cap Rate is a leading commercial and residential real estate marketplace with:
- 300K+ Active Listings
- 13M+ Monthly Visitors  
- $380B+ In Transaction Value
- Over 30 years of industry leadership
- Trusted by Fortune 1000 companies (96% search on Cap Rate)

=== MAIN SECTIONS & FEATURES ===

1. HERO SECTION (Homepage):
   - Main search interface with location autocomplete
   - Tabs: "For Lease", "For Sale", "Auctions", "Businesses For Sale"
   - Property type filters: Office, Retail, Industrial, Flex, Coworking, Medical
   - Location search supports: City, State, ZIP, Address, Neighborhood, School, County
   - Stats display: Active Listings, Monthly Visitors, Transaction Value
   - Trusted companies showcase: Adobe, Brookfield, Disney, eBay, FedEx, Nuveen, PepsiCo, Walmart

2. TRENDING PROPERTIES / LISTINGS SECTION:
   - Shows featured properties with tabs: For Lease, For Sale, Auctions
   - Property cards display: Price, Address, City/State/ZIP, Size, Type
   - Favorite/save functionality (heart icon)
   - Click property to view details
   - Horizontal scroll on mobile, grid on desktop

3. AUCTIONS SECTION:
   - Live auction listings
   - Transparent bidding platform
   - 11,000+ properties successfully transacted
   - Property types: Hospitality, Commercial, etc.
   - Shows location and property details

4. POPULAR CITIES SECTION:
   - Browse properties by major cities
   - Cities include: NYC, London, Paris, Madrid, Toronto, Los Angeles
   - Visual city cards with hover effects
   - Horizontal scrollable interface

5. TOOLS SECTION:
   - Office Space Calculator: Determine space needs
   - Find a Broker: Search brokers with bios, listings, specialties
   - Interactive tool cards with images

6. ARTICLES SECTION:
   - Educational content about commercial real estate
   - Topics: Office trends, Property types, Lease structures, Investment guides
   - "Commercial Real Estate Explained" content hub

7. MARKETING SECTION:
   - Information for property owners/advertisers
   - Cap Rate listings lease/sell 14% faster
   - Features: Right Audience, Engage Prospects, More Opportunity
   - Marketing solutions for property owners

8. FAQ SECTION:
   - Common questions about commercial real estate
   - Topics: International searches, Office vs Coworking, Multifamily investing
   - Expandable FAQ items

9. FOOTER NAVIGATION:
   - Organized by categories: For Sale, For Lease, Coworking, Auctions, Investment Tools, International
   - Extensive property type links
   - Location-based searches

=== PROPERTY TYPES ===
- Office: Traditional office spaces, executive suites
- Retail: Storefronts, shopping centers, retail spaces
- Industrial: Warehouses, manufacturing facilities, distribution centers
- Flex: Flexible spaces combining office/warehouse
- Coworking: Shared workspaces, hot desks, private offices
- Medical: Medical offices, clinics, healthcare facilities
- Restaurant: Dining establishments, food service spaces
- Land: Development land, vacant lots
- Multifamily: Apartment buildings, residential complexes
- Hospitality: Hotels, hospitality properties

=== SEARCH & NAVIGATION ===
- Main Search: Hero section on homepage
- Search Results: /unified-search page (shows Residential and Commercial separately)
- Property Details: 
  - Residential: /property/cr/[zpid]
  - Commercial: /property/commercial/[id]
  - Zillow: /property/zillow/[zpid]
- Search Filters: Location, Property Type, For Lease/For Sale status
- Location Autocomplete: Real-time suggestions as you type

=== USER FEATURES ===
- Save Favorites: Heart icon on property cards
- Saved Searches: Store search criteria
- My Account: User preferences, leads, reports
- Notifications: Property alerts and updates
- Compare Properties: Side-by-side comparison
- Follow Listings: Get updates on saved properties

=== ADVERTISING & LISTING ===
- Advertise Page: /advertise
- Add Listings: Property owners can list properties
- Marketing Center: Tools for property marketing
- Listing Management: Manage existing listings

=== CONTACT & SUPPORT ===
- Phone: +1 (917) 209-6200
- WhatsApp: Button in bottom-right corner
- AI Assistant: This chat interface (you!)
- Help Center: Available in sidebar menu

=== NAVIGATION COMPONENTS ===
- Top Navbar: Logo, Log In, Advertise buttons
- Sidebar Menu: User settings, Search options, Saved items, Account, Tools
- Footer: Links, navigation, company info
- Mobile Menu: Hamburger menu for mobile devices

=== KEY FUNCTIONALITY ===
- Location Autocomplete: Smart search with city, neighborhood, school, ZIP suggestions
- Property Filtering: By type, location, lease/sale status
- Property Details: Full information, images, maps, contact options
- Responsive Design: Works on mobile, tablet, desktop
- Smooth Animations: Framer Motion animations throughout

=== YOUR CAPABILITIES ===
You can help users with:
- Finding properties by location, type, or criteria
- Understanding how to use search features
- Explaining property types and their uses
- Navigating to specific sections of the platform
- Understanding platform features and tools
- Property investment guidance
- Leasing vs buying decisions
- Scheduling viewings and contacting brokers
- Using calculators and tools
- Accessing educational content
- Account and saved items management
- Advertising and listing properties

=== RESPONSE STYLE ===
- Be friendly, professional, and helpful
- Provide specific, actionable guidance
- Reference actual platform features and sections
- Use natural, conversational language
- When users ask about navigation, provide clear directions
- When users ask about features, explain how they work
- When users ask about properties, guide them to search or specific listings
- Always offer to help further or connect them with a broker if needed

Remember: You have complete knowledge of the platform. Help users understand and navigate Cap Rate effectively!`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AIAssistantIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI real estate assistant for Cap Rate. I have comprehensive knowledge about our entire platform - from searching properties to understanding features, tools, and navigation. I can help you find properties, explain how features work, guide you to specific sections, answer questions about property types, and much more! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBrokerMessage, setShowBrokerMessage] = useState(false);
  const brokerMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Random blink animation
  useEffect(() => {
    const blink = () => {
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.style.transform = 'scaleY(0.1)';
        setTimeout(() => {
          if (eyeLeftRef.current && eyeRightRef.current) {
            eyeLeftRef.current.style.transform = 'scaleY(1)';
            eyeRightRef.current.style.transform = 'scaleY(1)';
          }
        }, 150);
        eyeRightRef.current.style.transform = 'scaleY(0.1)';
      }
    };

    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        blink();
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
  }, []);

  // Show "broker will be available shortly" when user types
  useEffect(() => {
    if (input.trim().length > 0 && !showBrokerMessage) {
      setShowBrokerMessage(true);
      if (brokerMessageTimeoutRef.current) {
        clearTimeout(brokerMessageTimeoutRef.current);
      }
      brokerMessageTimeoutRef.current = setTimeout(() => {
        setShowBrokerMessage(false);
      }, 3000);
    } else if (input.trim().length === 0) {
      setShowBrokerMessage(false);
      if (brokerMessageTimeoutRef.current) {
        clearTimeout(brokerMessageTimeoutRef.current);
      }
    }

    return () => {
      if (brokerMessageTimeoutRef.current) {
        clearTimeout(brokerMessageTimeoutRef.current);
      }
    };
  }, [input, showBrokerMessage]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const userContent = input.trim().toLowerCase();
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowBrokerMessage(false);
    if (brokerMessageTimeoutRef.current) {
      clearTimeout(brokerMessageTimeoutRef.current);
    }
    setLoading(true);

    // Quick responses for common queries
    if (userContent.includes('schedule') || userContent.includes('viewing') || userContent.includes('appointment')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I\'d be happy to help you schedule a property viewing! Here are your options:\n\n1. **Call us directly**: +1 (917) 209-6200\n2. **WhatsApp**: Click the green WhatsApp button in the bottom-right corner\n3. **Tell me the property**: Share the property address or listing ID, and I can help coordinate a viewing\n\nYou can also browse properties in the "Trending Properties" section on the homepage, or use the search in the Hero section to find specific properties. Once you find one you like, click on it to see full details and contact options.' }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    if (userContent.includes('contact') || userContent.includes('phone') || userContent.includes('call') || userContent.includes('reach')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'You can reach Cap Rate through multiple channels:\n\n📞 **Phone**: +1 (917) 209-6200\n💬 **WhatsApp**: Click the WhatsApp button (bottom-right corner)\n💬 **AI Assistant**: You\'re using it right now! (me)\n\nFor property inquiries, viewings, listing questions, or general support, feel free to contact us anytime. Our team is here to help with all your commercial and residential real estate needs!' }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const conversationMessages = messages.filter(m => m.role !== 'system');
      const allMessagesForAPI = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationMessages,
        userMessage
      ].map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(CHATGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: allMessagesForAPI,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || data.message || 'I apologize, I encountered an error. Please try again or contact us at +1 (917) 209-6200.';

      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I apologize, I encountered an error. Please feel free to call us at +1 (917) 209-6200 or use the WhatsApp button for immediate assistance. I can also help with property searches, viewing schedules, and answering questions about our listings!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleIconClick = () => {
    setIsOpen(!isOpen);
    if (iconRef.current) {
      iconRef.current.style.animation = 'none';
      setTimeout(() => {
        if (iconRef.current) {
          iconRef.current.style.animation = '';
        }
      }, 10);
    }
  };

  return (
    <>
      {/* AI Assistant Icon Button */}
      <motion.div
        ref={iconRef}
        className="fixed bottom-[5.5rem] right-3 md:bottom-24 md:right-6 w-12 h-12 md:w-14 md:h-14 z-50 cursor-pointer"
        onClick={handleIconClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-yellow via-accent-yellow to-orange-500 shadow-lg transition-shadow hover:shadow-xl hover:shadow-accent-yellow/50" />

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Eyes Container */}
        <div className="absolute inset-0 flex items-start justify-center gap-1.5 text-primary-black z-10 pointer-events-none" style={{ top: '10%' }}>
          <motion.div
            ref={eyeLeftRef}
            className="text-lg font-bold transition-transform duration-100 origin-center"
            animate={{
              textShadow: [
                '0 0 5px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 165, 0, 0.8)',
                '0 0 5px rgba(255, 215, 0, 0.5)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            A
          </motion.div>
          <motion.div
            ref={eyeRightRef}
            className="text-lg font-bold transition-transform duration-100 origin-center"
            animate={{
              textShadow: [
                '0 0 5px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 165, 0, 0.8)',
                '0 0 5px rgba(255, 215, 0, 0.5)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            I
          </motion.div>
        </div>

        {/* Smile SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 56 56">
          <defs>
            <path id="curve-assistant" d="M 3.9,38 Q 28,58 52.1,38" fill="transparent" />
          </defs>
          <text
            className="text-[6px] font-bold fill-primary-black"
            style={{ letterSpacing: '1px' }}
          >
            <textPath href="#curve-assistant" startOffset="50%" textAnchor="middle">
              assistant
            </textPath>
          </text>
        </svg>

        {/* Sparkles - Show when chat is open */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            style={{
              top: i === 1 ? '10%' : i === 2 ? '20%' : i === 3 ? '85%' : i === 4 ? '50%' : i === 5 ? '50%' : '70%',
              left: i === 1 ? '90%' : i === 2 ? '5%' : i === 3 ? '5%' : i === 4 ? '0%' : i === 5 ? '100%' : '10%',
              right: i === 4 ? 'auto' : i === 5 ? 'auto' : 'auto',
            }}
            animate={isOpen ? {
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            } : {
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1,
              repeat: isOpen ? Infinity : 0,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Chat Widget - Positioned on the right side */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            className="fixed bottom-20 md:bottom-40 right-2 md:right-6 left-2 md:left-auto w-[calc(100vw-1rem)] md:w-96 h-[calc(100vh-5rem)] md:h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200 max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-12rem)]"
          >
            <div className="bg-accent-yellow px-3 md:px-4 py-2.5 md:py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="sm:w-5 sm:h-5 text-primary-black" />
                <h3 className="font-bold text-sm sm:text-base text-primary-black">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-black hover:bg-yellow-400 rounded p-1 transition-colors touch-manipulation"
                aria-label="Close chat"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 ${
                      message.role === 'user'
                        ? 'bg-accent-yellow text-primary-black'
                        : 'bg-gray-100 text-primary-black'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {showBrokerMessage && !loading && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-blue-700">
                      💬 A broker will be available shortly to assist you with your inquiry...
                    </p>
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-3 md:p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about properties..."
                  className="flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 sm:px-4 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px] sm:min-w-[48px]"
                >
                  <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
