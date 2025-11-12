'use client';

import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import Image from 'next/image';

export default function AdvertisePage() {
  const marketingPackages = [
    {
      name: 'Basic',
      price: '$299/month',
      features: [
        'Property listing on Commercial RE',
        'Up to 10 photos',
        'Basic property details',
        'Contact form',
      ],
    },
    {
      name: 'Premium',
      price: '$599/month',
      features: [
        'Everything in Basic',
        'Up to 25 photos',
        'Virtual tour integration',
        'Featured placement',
        'Priority support',
        'Analytics dashboard',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Everything in Premium',
        'Unlimited photos',
        'Custom branding',
        'Dedicated account manager',
        'Advanced analytics',
        'Multi-property management',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        {/* Full Background Image - Mobile */}
        <div className="absolute inset-0 w-full md:hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80)',
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-white/50" />
        </div>
        
        {/* Split Background - Desktop */}
        <div className="hidden md:flex absolute inset-0">
          {/* Left side - white/content area */}
          <div className="w-1/2 bg-white" />
          {/* Right side - image */}
          <div className="w-1/2 relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80)',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 py-20 w-full">
          <div className="max-w-2xl md:max-w-xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-1 h-24 bg-accent-yellow rounded-full" />
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-5xl md:text-6xl font-extrabold text-primary-black mb-6"
                >
                  CHOOSE TO CLOSE FASTER.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-custom-gray mb-8 leading-relaxed"
                >
                  When you list your property on the world&apos;s #1 commercial real estate marketplace, 
                  you&apos;ll be exposed to the largest dedicated audience in CRE. That means your property 
                  will sell or lease <span className="font-semibold text-primary-black">14% faster</span>.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="px-8 py-4 bg-accent-yellow text-primary-black rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg"
                >
                  View Marketing Options
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Section */}
      <div className="py-20 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-primary-black mb-4 text-center"
          >
            GET TO KNOW THE COMMERCIAL RE PLATFORM
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-custom-gray text-center mb-12 max-w-3xl mx-auto"
          >
            Put the power of the world&apos;s biggest and busiest commercial real estate marketplace 
            to work for your listings.
          </motion.p>

          {/* Video Thumbnail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative h-96 md:h-[500px] rounded-lg overflow-hidden cursor-pointer group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80)',
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="text-primary-black ml-1" size={32} fill="currentColor" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marketing Packages */}
      <div className="py-20 px-5 bg-light-gray">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary-black mb-12 text-center">
            Choose Your Marketing Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {marketingPackages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-2xl font-bold text-primary-black mb-2">{pkg.name}</h3>
                <p className="text-3xl font-bold text-accent-yellow mb-6">{pkg.price}</p>
                <ul className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="text-accent-yellow flex-shrink-0 mt-1" size={20} />
                      <span className="text-custom-gray">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-8 px-6 py-3 border-2 border-primary-black rounded-lg font-semibold text-primary-black hover:bg-primary-black hover:text-white transition-all">
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-5 bg-primary-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-extrabold text-accent-yellow mb-2">300K+</div>
              <div className="text-lg text-gray-300">Active Listings</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-accent-yellow mb-2">13M+</div>
              <div className="text-lg text-gray-300">Monthly Visitors</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-accent-yellow mb-2">14%</div>
              <div className="text-lg text-gray-300">Faster Close Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

