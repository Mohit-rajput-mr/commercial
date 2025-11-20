'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const partners = [
  { name: 'Adobe', logo: '/assets/adobe.png' },
  { name: 'Brookfield', logo: '/assets/brookfield.png' },
  { name: 'Disney', logo: '/assets/disney.png' },
  { name: 'eBay', logo: '/assets/ebay.png' },
  { name: 'FedEx', logo: '/assets/fedex.png' },
  { name: 'Nuveen', logo: '/assets/Nuveen.png' },
  { name: 'PepsiCo', logo: '/assets/pepsico.png' },
  { name: 'Walmart', logo: '/assets/walmart.png' },
];

export default function TrustedPartners() {
  // Duplicate the array to create seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div className="py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center"
        >
          Our Trusted Partners
        </motion.h2>

        <div className="relative overflow-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-primary-black/70 via-primary-black/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-primary-black/70 via-primary-black/60 to-transparent z-10 pointer-events-none" />

          {/* Infinite scrolling container */}
          <div className="flex gap-6 md:gap-8 lg:gap-12 partners-scroll">
            {duplicatedPartners.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 flex items-center justify-center h-12 md:h-16 lg:h-20 w-24 md:w-32 lg:w-40 transition-all duration-300 opacity-70 hover:opacity-100"
                style={{ filter: 'brightness(0) invert(1)' }}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={160}
                  height={80}
                  className="object-contain max-h-full w-auto"
                  unoptimized
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

