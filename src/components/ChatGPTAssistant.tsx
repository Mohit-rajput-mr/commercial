'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const RAPIDAPI_KEY = 'faf657766emsha74fedf2f6947fdp14c2b1jsn61fd3e532c38';
const RAPIDAPI_HOST = 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com';
const CHATGPT_API_URL = `https://${RAPIDAPI_HOST}/v1/chat/completions`;

const SYSTEM_PROMPT = `You are an AI real estate assistant for a commercial and residential property marketplace platform. Your role is to help users navigate the platform, find properties, and understand features.

PLATFORM KNOWLEDGE:
- The platform offers both RESIDENTIAL and COMMERCIAL properties
- Users can search by location (city, state, ZIP code, address, neighborhood, school, county)
- Main search is in the Hero section on the homepage
- Search results are shown on the /unified-search page with separate sections for Residential and Commercial properties
- Property detail pages: /property/cr/[zpid] for residential, /property/commercial/[zpid] for commercial
- Property types include: Office, Retail, Industrial, Flex, Coworking, Medical, Restaurant, Land

KEY FEATURES:
1. Location Autocomplete: Real-time suggestions as users type (cities, neighborhoods, schools, ZIP codes, addresses)
2. Unified Search: Single search queries both residential and commercial databases
3. Property Filters: Filter by property type, price range, size
4. Property Details: Full details, images, descriptions, maps
5. WhatsApp Contact: Direct contact button available

HOW TO GUIDE USERS:
- To search properties: "Use the search box in the Hero section and type a location like 'Miami, FL' or 'New York'"
- To view search results: "Click Search Properties or select a location suggestion to see all matching properties"
- To filter: "Use the property type icons in the search panel to filter by Office, Retail, Industrial, etc."
- To see details: "Click on any property card to view full details, images, and contact information"
- To contact: "Use the WhatsApp button (bottom-right) or contact info on property detail pages"

When users ask about searching, properties, or navigation, provide clear, actionable guidance and direct them to the right pages or features. Be friendly, helpful, and concise.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatGPTAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI real estate assistant. I can help you search for properties, navigate the platform, find property details, and answer questions about commercial and residential real estate. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const userContent = input.trim().toLowerCase();
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Quick navigation shortcuts for faster responses
    if (userContent.includes('search') || userContent.includes('find properties') || userContent.includes('look for')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I can help you search for properties! Use the search box in the Hero section at the top of the page. Type a location like "Miami, FL" or "New York" and you\'ll see suggestions. Click Search Properties or select a suggestion to see all matching residential and commercial properties.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('residential') || userContent.includes('home') || userContent.includes('house')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'For residential properties, search using the Hero search box. All residential properties are shown in the first section on the search results page. Click any residential property card to view details, images, price, bedrooms, bathrooms, and more.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('commercial') || userContent.includes('office') || userContent.includes('retail') || userContent.includes('industrial')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'For commercial properties (Office, Retail, Industrial, Flex, Coworking, Medical, etc.), search using the Hero search box. Commercial properties are shown in the second section on the search results page. Use the property type icons in the search panel to filter by specific commercial types.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('contact') || userContent.includes('whatsapp') || userContent.includes('message')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'You can contact us via the WhatsApp button in the bottom-right corner of the page, or view contact information on any property detail page. Click on a property to see agent details and contact options.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('trending') || userContent.includes('popular') || userContent.includes('best') || userContent.includes('featured')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'To find trending or popular properties, use the Hero search box to search by location. All available properties in that area will be shown. You can sort results on the search results page. For featured properties, use the property type filters (Office, Retail, Industrial, etc.) in the search panel to find the most relevant options.' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('what can you do') || userContent.includes('what can you') || userContent.includes('capabilities') || userContent.includes('help me')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I can help you with:\n\n🔍 Search for properties by location (city, state, ZIP, address)\n🏠 Find residential properties (homes, houses)\n🏢 Find commercial properties (Office, Retail, Industrial, Flex, Coworking, Medical, Restaurant, Land)\n📍 Navigate the platform and understand features\n📋 View property details, images, and descriptions\n💬 Guide you on how to contact agents\n🎯 Help filter and sort search results\n\nUse the search box in the Hero section to start finding properties, or ask me specific questions!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    if (userContent.includes('hello') || userContent.includes('hi') || userContent.includes('hey') || userContent.includes('how are you')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Hello! I\'m doing great, thanks for asking! I\'m here to help you find properties, navigate our platform, and answer any questions about commercial and residential real estate. What would you like to know? You can ask me how to search, find specific property types, or get help with navigation!' }
        ]);
        setLoading(false);
        return;
      }, 500);
      return;
    }

    try {
      // Prepare messages with system prompt - filter out system messages for the API
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
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle different possible response formats
      let content = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content;
      } else if (data.content) {
        content = data.content;
      } else if (data.message) {
        content = data.message;
      } else if (typeof data === 'string') {
        content = data;
      } else {
        content = JSON.stringify(data);
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
      console.error('ChatGPT API error details:', {
        error: error,
        message: error?.message,
        stack: error?.stack
      });
      
      let errorMessage = 'Sorry, I encountered an error. Please try again later.';
      
      if (error?.message) {
        if (error.message.includes('429')) {
          errorMessage = 'I\'m receiving too many requests right now. Please wait a moment and try again.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'There\'s an authentication issue. Please contact support.';
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          errorMessage = 'API rate limit reached. Please try again in a few moments.';
        } else {
          // Show a helpful fallback response based on the query
          if (userContent.includes('trending') || userContent.includes('popular') || userContent.includes('best')) {
            errorMessage = 'I can help you find properties! Use the search box in the Hero section to search by location. You can filter by property type (Office, Retail, Industrial, etc.) and see all available properties in your area. The search results show both residential and commercial properties.';
          } else if (userContent.includes('what') || userContent.includes('how') || userContent.includes('can')) {
            errorMessage = 'I can help you search for properties, navigate the platform, find property details, filter by type or location, and answer questions about commercial and residential real estate. Use the Hero search box to find properties, or ask me specific questions!';
          } else {
            errorMessage = 'Sorry, I encountered an error. But I can still help! Try asking: "How do I search for properties?" or "What property types are available?" or use the search box in the Hero section at the top of the page.';
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage }
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
        className="fixed bottom-6 left-6 w-14 h-14 bg-accent-yellow text-primary-black rounded-full shadow-lg hover:bg-yellow-400 transition-all z-50 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200"
          >
            <div className="bg-accent-yellow px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-primary-black" />
                <h3 className="font-bold text-primary-black">AI Assistant</h3>
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
                  placeholder="Type your message..."
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

