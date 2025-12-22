'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Terms of Use', href: '/terms-of-use' },
      { label: 'Privacy Notice', href: '/privacy-notice' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary-black text-white py-12 px-5">
      <div className="max-w-7xl 2xl:max-w-[90%] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {/* Logo */}
              <div className="relative h-10 w-40">
                <Image
                  src="/assets/logoRE.png"
                  alt="Cap Rate"
                  fill
                  className="object-contain object-left"
                />
              </div>

              <p className="text-custom-gray text-sm max-w-xs">
                Your trusted commercial real estate platform for buying, selling, and leasing properties.
              </p>

              {/* Social */}
              <div>
                <p className="text-custom-gray mb-3 text-sm">Connect with us</p>
                <div className="flex gap-2">
                  {[Linkedin, Facebook, Instagram, Youtube].map((Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-9 h-9 bg-white/10 hover:bg-accent-yellow rounded-lg flex items-center justify-center transition-all"
                    >
                      <Icon size={18} />
                    </motion.a>
                  ))}
                </div>
              </div>
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
              className="space-y-3"
            >
              <h4 className="font-bold text-base mb-3">{column.title}</h4>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-custom-gray hover:text-accent-yellow transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-custom-gray">
            &copy; {new Date().getFullYear()} capratecompany. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-custom-gray">
            <a href="#" className="hover:text-accent-yellow transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-accent-yellow transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
