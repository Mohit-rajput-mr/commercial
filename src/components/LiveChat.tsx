'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Phone } from 'lucide-react';
import { pusherClient } from '@/lib/pusher-client';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyAddress?: string;
}

export default function LiveChat({ isOpen, onClose, propertyId, propertyAddress }: LiveChatProps) {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'admin'; timestamp: Date }>>([]);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ id: string; name: string; full_name?: string; email: string; phone: string } | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  // Leo Jo contact info
  const leoJoPhone = '+1 (917) 209-6200';
  const leoJoEmail = 'leojoemail@gmail.com';

  // Check if user is logged in and ensure they have required fields
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Ensure user has required fields
        if (parsedUser && parsedUser.email) {
          // If user doesn't have an ID but has email, we'll get/create one when initializing chat
          setUser({
            id: parsedUser.id || '',
            name: parsedUser.name || parsedUser.full_name || '',
            full_name: parsedUser.full_name || parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || parsedUser.phone_number || '+1 (917) 209-6200',
          });
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const initializeChat = useCallback(async (): Promise<(() => void) | undefined> => {
    if (!user) {
      setLoading(false);
      setIsConnected(false);
      return;
    }

    try {
      setLoading(true);
      setIsConnected(false);
      
      // Ensure we have user email before proceeding
      if (!user || !user.email) {
        throw new Error('User email is required. Please log in again.');
      }

      // Create or get existing chat - send user info in headers
      const chatResponse = await fetch('/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id || '',
          'x-user-email': user.email || '',
          'x-user-name': user.full_name || user.name || '',
          'x-user-phone': user.phone || '+1 (917) 209-6200',
        },
        body: JSON.stringify({ 
          property_id: propertyId || null,
          user: user, // Also send in body as fallback
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Failed to create chat: ${chatResponse.statusText}`);
      }

      const chatData = await chatResponse.json();
      
      if (!chatData.success || !chatData.chat) {
        throw new Error(chatData.error || 'Failed to create chat');
      }

      const newChatId = chatData.chat.id;
      setChatId(newChatId);

      // Load existing messages
      try {
        const messagesResponse = await fetch(`/api/chats/${newChatId}/messages`);
        const messagesData = await messagesResponse.json();

        if (messagesData.success && messagesData.messages) {
          const formattedMessages = messagesData.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender?.role === 'admin' ? 'admin' as const : 'user' as const,
            text: msg.message_text,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formattedMessages);
        }
      } catch (msgError) {
        console.error('Error loading messages:', msgError);
        // Continue even if messages fail to load
      }

      // Subscribe to Pusher channel for real-time updates
      try {
        const channel = pusherClient.subscribe(`chat-${newChatId}`);
        
        // Wait for subscription to be ready
        channel.bind('pusher:subscription_succeeded', () => {
          console.log('Pusher subscription succeeded');
          setIsConnected(true);
          setLoading(false);
        });

        channel.bind('pusher:subscription_error', (error: any) => {
          console.error('Pusher subscription error:', error);
          setIsConnected(false);
          setLoading(false);
        });

        const messageHandler = (data: any) => {
          const newMsg = {
            id: data.message.id,
            sender: data.sender?.role === 'admin' ? 'admin' as const : 'user' as const,
            text: data.message.message_text,
            timestamp: new Date(data.message.created_at),
          };
          // Check if message already exists to avoid duplicates
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
        };
        channel.bind('new-message', messageHandler);

        // Set connected after a short delay to ensure subscription
        setTimeout(() => {
          setIsConnected(true);
          setLoading(false);
        }, 500);

        // Return cleanup function
        return () => {
          channel.unbind('new-message', messageHandler);
          channel.unbind('pusher:subscription_succeeded');
          channel.unbind('pusher:subscription_error');
          pusherClient.unsubscribe(`chat-${newChatId}`);
        };
      } catch (pusherError) {
        console.error('Pusher subscription error:', pusherError);
        // Still allow chatting even if Pusher fails
        setIsConnected(true);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      setIsConnected(false);
      setLoading(false);
      alert(`Failed to initialize chat: ${error.message || 'Unknown error'}. Please try again.`);
    }
    return undefined;
  }, [user, propertyId]);

  // Initialize chat when opened
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isMounted = true;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (!user) {
        // If not logged in, prompt for login
        window.dispatchEvent(new CustomEvent('openLoginModal'));
        onClose();
        return;
      }

      // Reset connection state when opening
      setIsConnected(false);
      setLoading(true);

      // Initialize chat and Pusher connection
      initializeChat().then((cleanupFn) => {
        if (isMounted) {
          cleanup = cleanupFn;
        }
      }).catch((error) => {
        console.error('Chat initialization error:', error);
        if (isMounted) {
          setIsConnected(false);
          setLoading(false);
          alert('Failed to initialize chat. Please try again.');
        }
      });
    } else {
      document.body.style.overflow = 'unset';
      setIsConnected(false);
      // Disconnect Pusher when closing
      if (chatId) {
        pusherClient.unsubscribe(`chat-${chatId}`);
      }
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
      if (cleanup) cleanup();
      if (chatId) {
        pusherClient.unsubscribe(`chat-${chatId}`);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user, chatId, initializeChat]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !chatId) return;

    const text = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id || '',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ 
          message_text: text,
          user_id: user.id, // Also send in body as fallback
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Failed to send message:', data.error);
        alert('Failed to send message. Please try again.');
        setMessageText(text); // Restore message on error
      }
      // Message will be added via Pusher event
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(text); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim() && chatId && !loading) {
        handleSendMessage();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Chat Window */}
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-primary-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary-black">Chat with Leo Jo</h2>
                  <p className="text-xs text-custom-gray">
                    {loading ? (
                      'Connecting...'
                    ) : chatId && isConnected ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </span>
                    ) : chatId ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Connected (Realtime pending...)
                      </span>
                    ) : (
                      'Connecting...'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={24} className="text-primary-black" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-custom-gray">Loading chat...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-custom-gray text-center">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-accent-yellow text-primary-black'
                          : 'bg-gray-200 text-primary-black'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs text-gray-600 mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Contact Buttons */}
              <div className="flex gap-2 mb-3">
                <a
                  href={`tel:${leoJoPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  <Phone size={16} /> Call
                </a>
                <a
                  href={`https://wa.me/${leoJoPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.77.46 3.45 1.26 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.46 14.3c-.2.56-.98 1.05-1.38 1.09-.39.04-.75.18-2.54-.53-2.14-.85-3.51-3.02-3.62-3.16-.1-.14-.85-1.13-.85-2.16s.54-1.53.73-1.74c.19-.21.42-.26.56-.26.14 0 .28 0 .4.01.13.01.3-.05.47.36.18.41.6 1.46.65 1.57.05.11.09.23.02.38-.07.14-.11.23-.21.36-.11.12-.23.27-.33.36-.11.1-.22.21-.09.42.12.21.54.89 1.16 1.44.8.71 1.47.93 1.68 1.03.21.11.33.09.46-.05.12-.15.52-.6.66-.81.14-.21.28-.18.47-.11.19.08 1.2.57 1.41.67.21.11.35.16.4.25.05.09.05.53-.14 1.09z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={loading ? "Connecting..." : chatId ? "Type your message..." : "Initializing chat..."}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={loading || !chatId || !user}
                  autoFocus
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || loading || !chatId || !user}
                  className="px-4 py-2 bg-accent-yellow rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title={!chatId ? "Please wait for chat to initialize" : ""}
                >
                  <Send size={20} />
                </button>
              </div>

              {user && (
                <p className="text-xs text-custom-gray mt-2">
                  Chatting as {user.full_name || user.name} ({user.email})
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
