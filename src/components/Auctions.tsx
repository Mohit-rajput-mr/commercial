'use client';

import { motion } from 'framer-motion';
import { Gavel, ArrowRight } from 'lucide-react';

export default function Auctions() {
  return (
    <div className="py-20 px-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-xl overflow-hidden shadow-2xl group"
          >
            {/* Main Image */}
            <div
              className="w-full h-[500px] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)',
              }}
            />

            {/* Live Auction Badge */}
            <div className="absolute top-8 -left-2 bg-accent-yellow text-primary-black px-8 py-4 font-bold text-lg shadow-xl">
              Live Auction
            </div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute bottom-8 left-8 bg-white p-6 rounded-lg shadow-2xl"
            >
              <h4 className="text-xl font-bold text-primary-black mb-1">
                Hospitality
              </h4>
              <p className="text-custom-gray">Waco, TX</p>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary-black leading-tight">
              Discover Your Next Investment at Auction
            </h2>

            <p className="text-lg text-custom-gray leading-relaxed">
              Identify and bid on quality assets through our transparent and competitive 
              platform—all online. Join the investors worldwide who have partnered with us 
              to successfully transact 11,000+ properties.
            </p>

            <a
              href="#"
              className="inline-block text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors"
            >
              Learn More About Auctions <ArrowRight className="inline ml-2" size={20} />
            </a>

            {/* CTA Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 p-6 bg-light-gray rounded-lg border-l-4 border-accent-yellow hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                <Gavel className="text-primary-black" size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary-black mb-1">
                  Live Auction Now
                </h4>
                <a
                  href="#"
                  className="text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors"
                >
                  See Available Listings
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

