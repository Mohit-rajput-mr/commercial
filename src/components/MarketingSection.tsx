'use client';

import { motion } from 'framer-motion';
import { Megaphone, Lightbulb, Handshake } from 'lucide-react';

const features = [
  {
    icon: Megaphone,
    title: 'Right Audience',
    description: '96% of the Fortune 1000 search on Cap Rate',
  },
  {
    icon: Lightbulb,
    title: 'Engage Prospects',
    description: 'Stunning photography, videos and drone shots',
  },
  {
    icon: Handshake,
    title: 'More Opportunity',
    description: 'Find a tenant or buyer, faster than before',
  },
];

export default function MarketingSection() {
  return (
    <div
      className="relative py-32 px-5 overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-black via-primary-black/95 to-primary-black/80" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto text-white">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-16 leading-tight"
        >
          Cap Rate Listings Lease or Sell{' '}
          <span className="text-accent-yellow">14% Faster*</span>
        </motion.h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-4"
                >
                  <Icon className="text-primary-black" size={32} />
                </motion.div>
                <h4 className="text-2xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-lg">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-accent-yellow text-primary-black rounded-xl font-bold text-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-accent-yellow/50"
          >
            Explore Marketing Solutions
          </motion.button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-sm text-gray-400 text-center max-w-3xl mx-auto"
        >
          *Based on internal analysis comparing properties advertised on Cap Rate to properties
          listed only on CoStar.
        </motion.p>
      </div>
    </div>
  );
}

