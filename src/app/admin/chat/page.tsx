'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Check, CheckCheck } from 'lucide-react';
import {
  getAdminChats,
  addChatMessage,
  markChatAsRead,
  saveAdminChats,
  initializeMockData,
} from '@/lib/admin-storage';
import type { Chat, ChatMessage } from '@/types/admin';

export default function LiveChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Unread' | 'Resolved' | 'Archived'>('All');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeMockData();
    loadChats();
    const interval = setInterval(loadChats, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChat) {
      markChatAsRead(selectedChat.id);
      loadChats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const loadChats = () => {
    const allChats = getAdminChats();
    setChats(allChats);
    if (selectedChat) {
      const updated = allChats.find((c) => c.id === selectedChat.id);
      if (updated) setSelectedChat(updated);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'admin',
      senderName: 'Admin',
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    addChatMessage(selectedChat.id, newMessage);
    setMessageText('');
    loadChats();
  };

  const filteredChats = chats.filter((chat) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return chat.unreadCount > 0;
    return chat.status === filter;
  }).filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.userName.toLowerCase().includes(query) ||
      chat.propertyAddress.toLowerCase().includes(query)
    );
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-primary-black mb-3">Active Chats</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-gray" size={18} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow text-sm"
          >
            <option value="All">All Chats</option>
            <option value="Active">Active</option>
            <option value="Unread">Unread</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-custom-gray">No chats found</div>
          ) : (
            filteredChats.map((chat) => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              const isSelected = selectedChat?.id === chat.id;

              return (
                <motion.div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent-yellow/20' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-primary-black truncate">{chat.userName}</div>
                      <div className="text-xs text-custom-gray truncate">{chat.propertyAddress}</div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-accent-yellow text-primary-black rounded-full px-2 py-0.5 text-xs font-bold flex-shrink-0">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <div className="text-sm text-custom-gray truncate">
                      {lastMessage.text.substring(0, 50)}
                      {lastMessage.text.length > 50 ? '...' : ''}
                    </div>
                  )}
                  <div className="text-xs text-custom-gray mt-1">
                    {formatTime(chat.lastMessageAt)}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-primary-black">{selectedChat.userName}</div>
                  <div className="text-sm text-custom-gray">{selectedChat.propertyAddress}</div>
                </div>
                <div className="text-sm text-green-600 font-semibold">Online</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map((message) => {
                const isAdmin = message.senderId === 'admin';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isAdmin
                          ? 'bg-accent-yellow text-primary-black'
                          : 'bg-gray-100 text-primary-black'
                      }`}
                    >
                      <div className="text-sm font-semibold mb-1">{message.senderName}</div>
                      <div className="text-sm">{message.text}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        {isAdmin && (
                          <span className="text-xs opacity-70">
                            {message.read ? <CheckCheck size={14} /> : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="px-6 py-2 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={20} />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-custom-gray">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


