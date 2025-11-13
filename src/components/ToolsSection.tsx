'use client';

import { motion } from 'framer-motion';
import { Calculator, UserSearch } from 'lucide-react';

const tools = [
  {
    icon: Calculator,
    title: 'Determine your Space Needs',
    description: 'Use our space calculator to find out how much square footage you need.',
    buttonText: 'Office Space Calculator',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
  },
  {
    icon: UserSearch,
    title: 'Find a Broker',
    description: 'Search for brokers in your area with information like bios, listings, specialties and more.',
    buttonText: 'Search for a Broker',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
  },
];

export default function ToolsSection() {
  return (
    <div className="py-20 px-5 bg-light-gray">
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="relative h-96 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${tool.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-black via-primary-black/60 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 text-white">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center mb-4"
                >
                  <Icon className="text-primary-black" size={32} />
                </motion.div>
                <h3 className="text-3xl font-bold mb-3">{tool.title}</h3>
                <p className="text-lg text-gray-200 mb-6">{tool.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-accent-yellow text-primary-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all w-fit"
                >
                  {tool.buttonText}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

