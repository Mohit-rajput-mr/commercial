'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react';
import { getAdminChats, addChatMessage, saveAdminChats } from '@/lib/admin-storage';
import type { Chat, ChatMessage } from '@/types/admin';

interface ChatWidgetProps {
  propertyId: string;
  propertyAddress: string;
  userId?: string;
  userName?: string;
}

export default function ChatWidget({
  propertyId,
  propertyAddress,
  userId = 'guest-user',
  userName = 'Guest User',
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find or create chat
    const chats = getAdminChats();
    let existingChat = chats.find(
      (c) => c.propertyId === propertyId && c.userId === userId
    );

    if (!existingChat) {
      // Create new chat
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        userId,
        userName,
        propertyId,
        propertyAddress,
        messages: [],
        status: 'Active',
        unreadCount: 0,
        lastMessageAt: new Date().toISOString(),
      };
      chats.push(newChat);
      saveAdminChats(chats);
      existingChat = newChat;
    }

    setChat(existingChat);

    // Poll for new messages
    const interval = setInterval(() => {
      const updatedChats = getAdminChats();
      const updated = updatedChats.find((c) => c.id === existingChat!.id);
      if (updated) {
        setChat(updated);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [propertyId, userId, userName, propertyAddress]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!message.trim() || !chat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      text: message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    addChatMessage(chat.id, newMessage);
    setMessage('');

    // Update local chat state
    const chats = getAdminChats();
    const updated = chats.find((c) => c.id === chat.id);
    if (updated) {
      setChat(updated);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!chat) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-accent-yellow text-primary-black rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-yellow-400 transition-colors"
        >
          <MessageSquare size={28} />
          {chat.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 flex flex-col ${
              isMinimized ? 'h-16' : 'h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-accent-yellow text-primary-black p-4 rounded-t-xl flex items-center justify-between">
              <div>
                <div className="font-bold">Talk to Broker</div>
                <div className="text-xs opacity-80">{propertyAddress}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-yellow-400 rounded transition-colors"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-yellow-400 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chat.messages.length === 0 ? (
                    <div className="text-center text-custom-gray py-8">
                      <p>Start a conversation with our broker!</p>
                    </div>
                  ) : (
                    chat.messages.map((msg) => {
                      const isUser = msg.senderId === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              isUser
                                ? 'bg-accent-yellow text-primary-black'
                                : 'bg-gray-100 text-primary-black'
                            }`}
                          >
                            <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                            <div className="text-sm">{msg.text}</div>
                            <div className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="px-4 py-2 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


