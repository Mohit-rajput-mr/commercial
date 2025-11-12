'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Facebook, Instagram, Youtube, Smartphone } from 'lucide-react';

const footerColumns = [
  {
    title: 'Search',
    links: ['Properties For Sale', 'Properties For Lease', 'Businesses For Sale', 'Find a Broker'],
  },
  {
    title: 'Products & Services',
    links: ['Advertise With Us', 'LoopLink', 'Help'],
  },
  {
    title: 'Marketplace',
    links: ['Showcase', 'CityFeet', 'Bureaux Locaux', 'Land.com', 'BizBuySell', 'Apartments.com', 'Homes.com'],
  },
  {
    title: 'Resources',
    links: ['Contact Us', 'Mobile', 'Site Map', 'CRE Explained', 'Commercial Terms'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Terms of Use', 'Privacy Notice', 'Cookie Policy', 'Exercise Your Rights', 'Licensing', 'Accessibility Commitment'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary-black text-white py-16 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="relative h-12 w-48">
                <Image
                  src="/assets/logoRE.png"
                  alt="Commercial RE"
                  fill
                  className="object-contain object-left"
                />
              </div>

              {/* Social */}
              <div>
                <p className="text-custom-gray mb-4">Connect with us</p>
                <div className="flex gap-3">
                  {[Linkedin, Facebook, Instagram, Youtube].map((Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-10 h-10 bg-white/10 hover:bg-accent-yellow rounded-lg flex items-center justify-center transition-all"
                    >
                      <Icon size={20} />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* App Downloads */}
              <div className="space-y-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <Smartphone size={20} />
                  <span className="font-semibold">Download on App Store</span>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <Smartphone size={20} />
                  <span className="font-semibold">Get it on Google Play</span>
                </motion.a>
              </div>

              {/* Copyright */}
              <p className="text-sm text-custom-gray pt-4">
                &copy; {new Date().getFullYear()} CoStar Group
              </p>
            </motion.div>
          </div>

          {/* Links Columns */}
          {footerColumns.map((column, colIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIndex * 0.1 }}
              className="space-y-4"
            >
              <h4 className="font-bold text-lg mb-4">{column.title}</h4>
              {column.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-custom-gray hover:text-accent-yellow transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}

