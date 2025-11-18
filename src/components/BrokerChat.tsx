'use client';

import { useState, useRef, useEffect } from 'react';
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
- Broker Chat: This chat interface (you!)
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

export default function BrokerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI real estate assistant for Cap Rate. I have comprehensive knowledge about our entire platform - from searching properties to understanding features, tools, and navigation. I can help you find properties, explain how features work, guide you to specific sections, answer questions about property types, and much more! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBrokerMessage, setShowBrokerMessage] = useState(false);
  const brokerMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show "broker will be available shortly" when user types
  useEffect(() => {
    if (input.trim().length > 0 && !showBrokerMessage) {
      setShowBrokerMessage(true);
      // Clear any existing timeout
      if (brokerMessageTimeoutRef.current) {
        clearTimeout(brokerMessageTimeoutRef.current);
      }
      // Hide message after 3 seconds of no typing
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

    // Enhanced quick responses for common queries with platform knowledge
    if (userContent.includes('schedule') || userContent.includes('viewing') || userContent.includes('appointment')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I\'d be happy to help you schedule a property viewing! Here are your options:\n\n1. **Call us directly**: +1 (917) 209-6200\n2. **WhatsApp**: Click the green WhatsApp button in the bottom-right corner\n3. **Tell me the property**: Share the property address or listing ID, and I can help coordinate a viewing\n\nYou can also browse properties in the "Trending Properties" section on the homepage, or use the search in the Hero section to find specific properties. Once you find one you like, click on it to see full details and contact options.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('contact') || userContent.includes('phone') || userContent.includes('call') || userContent.includes('reach')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'You can reach Cap Rate through multiple channels:\n\n📞 **Phone**: +1 (917) 209-6200\n💬 **WhatsApp**: Click the WhatsApp button (bottom-right corner)\n💬 **Broker Chat**: You\'re using it right now! (me)\n\nFor property inquiries, viewings, listing questions, or general support, feel free to contact us anytime. Our team is here to help with all your commercial and residential real estate needs!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('price') || userContent.includes('cost') || userContent.includes('rent') || userContent.includes('how much')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Property prices vary significantly based on:\n- **Location**: City, neighborhood, market area\n- **Property Type**: Office, Retail, Industrial, Flex, etc.\n- **Size**: Square footage\n- **Condition**: Age, renovations, amenities\n- **Market Conditions**: Local demand and supply\n\n**To see prices**:\n1. Use the Hero search box on the homepage\n2. Browse "Trending Properties" section\n3. Click any property card to see detailed pricing\n4. Visit /unified-search for comprehensive listings\n\nFor specific pricing on a property you\'re interested in, share the address or listing, and I can guide you to the details page or connect you with a broker!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('search') || userContent.includes('find') || userContent.includes('properties') || userContent.includes('look for')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Here\'s how to search for properties on Cap Rate:\n\n**Main Search (Hero Section)**:\n1. Go to the homepage Hero section (top of page)\n2. Choose a tab: "For Lease", "For Sale", "Auctions", or "Businesses For Sale"\n3. Select property type icons: Office, Retail, Industrial, Flex, Coworking, Medical\n4. Type a location (city, state, ZIP, address, neighborhood)\n5. Select from autocomplete suggestions or click "Search Properties"\n\n**Browse Sections**:\n- **Trending Properties**: Featured listings on homepage\n- **Popular Cities**: Browse by major cities\n- **Auctions**: Live auction listings\n\n**Search Results**: After searching, you\'ll see results on /unified-search with separate sections for Residential and Commercial properties. Click any property for full details!\n\nWhat type of property are you looking for? I can help you refine your search!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    // Navigation help
    if (userContent.includes('navigate') || userContent.includes('go to') || userContent.includes('where is') || userContent.includes('how do i get to')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I can help you navigate to any section of Cap Rate! Here are the main areas:\n\n**Homepage Sections**:\n- Hero (top): Main search\n- Trending Properties: Featured listings\n- Auctions: Live auction properties\n- Popular Cities: Browse by location\n- Tools: Space calculator, Find a Broker\n- Articles: Educational content\n- Marketing: For property owners\n- FAQ: Common questions\n\n**Key Pages**:\n- Search Results: /unified-search\n- Property Details: /property/[id] or /property/commercial/[id]\n- Advertise: /advertise (for listing properties)\n\n**Navigation Elements**:\n- Top Navbar: Logo, Log In, Advertise\n- Sidebar Menu: User settings, saved items, tools (click hamburger menu)\n- Footer: Extensive links organized by category\n\nWhat section would you like to visit? I can guide you there!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    // Property types
    if (userContent.includes('property type') || userContent.includes('what types') || userContent.includes('office') || userContent.includes('retail') || userContent.includes('industrial') || userContent.includes('flex') || userContent.includes('coworking') || userContent.includes('medical')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Cap Rate offers many property types:\n\n**🏢 Office**: Traditional office spaces, executive suites, corporate buildings\n**🏪 Retail**: Storefronts, shopping centers, retail spaces, store locations\n**🏭 Industrial**: Warehouses, manufacturing facilities, distribution centers\n**⚙️ Flex**: Flexible spaces combining office and warehouse functionality\n**👥 Coworking**: Shared workspaces, hot desks, private offices, meeting rooms\n**🏥 Medical**: Medical offices, clinics, healthcare facilities\n**🍽️ Restaurant**: Dining establishments, food service spaces\n**🏗️ Land**: Development land, vacant lots for building\n**🏘️ Multifamily**: Apartment buildings, residential complexes\n**🏨 Hospitality**: Hotels, hospitality properties\n\nYou can filter by property type in the Hero search section using the icon buttons. Each type has different characteristics, pricing, and use cases. Which type are you interested in? I can explain more about it!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    // Features and tools
    if (userContent.includes('feature') || userContent.includes('tool') || userContent.includes('calculator') || userContent.includes('broker search') || userContent.includes('what can i do')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Cap Rate has many powerful features:\n\n**Search & Discovery**:\n- Advanced location search with autocomplete\n- Filter by property type, lease/sale status\n- Browse trending properties and popular cities\n- View detailed property information\n\n**User Features**:\n- Save favorites (heart icon on property cards)\n- Saved searches for alerts\n- Compare properties side-by-side\n- Follow listings for updates\n- Account management\n\n**Tools**:\n- **Office Space Calculator**: Determine how much square footage you need\n- **Find a Broker**: Search brokers with bios, listings, specialties, and contact info\n\n**For Property Owners**:\n- List properties on /advertise page\n- Marketing center for property promotion\n- Manage listings\n- Analytics and insights\n\n**Educational**:\n- Articles section with real estate guides\n- FAQ section with common questions\n- Investment tools and guides\n\nWhat feature would you like to learn more about or use?' }
        ]);
        setLoading(false);
        return;
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

      const requestBody = {
        model: 'gpt-4o',
        messages: allMessagesForAPI,
        max_tokens: 500,
        temperature: 0.7,
      };

      const response = await fetch(CHATGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      let content = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content;
      } else if (data.content) {
        content = data.content;
      } else if (data.message) {
        content = data.message;
      }

      if (!content || content.trim() === '') {
        throw new Error('Empty response from API');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Broker chat error:', error);
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 left-6 w-14 h-14 bg-accent-yellow text-primary-black rounded-full shadow-lg hover:bg-yellow-400 transition-all z-50 flex items-center justify-center"
        aria-label="Talk with Broker"
        title="Talk with Broker"
      >
        {isOpen ? <X size={24} /> : <User size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 left-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200"
          >
            <div className="bg-accent-yellow px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={20} className="text-primary-black" />
                <h3 className="font-bold text-primary-black">Talk with Broker</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-black hover:bg-yellow-400 rounded p-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-accent-yellow text-primary-black'
                        : 'bg-gray-100 text-primary-black'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about properties, viewings, prices..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-accent-yellow text-primary-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

