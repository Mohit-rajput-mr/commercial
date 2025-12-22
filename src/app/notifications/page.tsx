'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-20"
        >
          <div className="p-4 bg-accent-yellow rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Bell className="w-12 h-12 text-primary-black" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
            Notifications
          </h1>
          <p className="text-gray-600 text-lg">
            Your notifications will appear here.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

