'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileJson, Home, ArrowLeft, Building2, Key } from 'lucide-react';
import Link from 'next/link';

// Define all available JSON files
const leaseFiles = [
  { name: 'Chicago Rental', file: 'chicago_rental.json', city: 'Chicago' },
  { name: 'Houston Rental', file: 'houston_rental.json', city: 'Houston' },
  { name: 'Los Angeles Rental', file: 'losangeles_rental.json', city: 'Los Angeles' },
  { name: 'Miami Beach Rental', file: 'miami_beach_rental.json', city: 'Miami Beach' },
  { name: 'Miami Rental', file: 'miami_rental.json', city: 'Miami' },
  { name: 'New York Rental', file: 'newyork_rental.json', city: 'New York' },
  { name: 'Philadelphia Rental', file: 'philadelphia_rental.json', city: 'Philadelphia' },
  { name: 'Phoenix Rental', file: 'phoenix_rental.json', city: 'Phoenix' },
  { name: 'San Antonio Rental', file: 'san_antonio_rental.json', city: 'San Antonio' },
];

const saleFiles = [
  { name: 'Chicago Sale', file: 'chicago_sale.json', city: 'Chicago' },
  { name: 'Houston Sale', file: 'houston_sale.json', city: 'Houston' },
  { name: 'Las Vegas Sale', file: 'las_vegas_sale.json', city: 'Las Vegas' },
  { name: 'Miami Beach Sale', file: 'miami_beach_sale.json', city: 'Miami Beach' },
  { name: 'Miami Sale', file: 'miami_sale.json', city: 'Miami' },
  { name: 'New York Sale', file: 'new_york_sale.json', city: 'New York' },
  { name: 'Philadelphia Sale', file: 'philadelphia_sale.json', city: 'Philadelphia' },
  { name: 'Phoenix Sale', file: 'phoenix_sale.json', city: 'Phoenix' },
  { name: 'San Antonio Sale', file: 'san-antonio_sale.json', city: 'San Antonio' },
];

export default function TestPage() {
  const router = useRouter();

  const handleFileClick = (folder: 'lease' | 'sale', fileName: string) => {
    // Navigate to jsoncards with the file info as query params
    router.push(`/jsoncards?folder=${folder}&file=${encodeURIComponent(fileName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileJson className="text-purple-400" />
                  JSON File Test Page
                </h1>
                <p className="text-gray-400 text-sm">Select a JSON file to view its properties</p>
              </div>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent-yellow hover:bg-yellow-400 text-black rounded-lg font-semibold flex items-center gap-2"
              >
                <Home size={18} />
                Home
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lease Files Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Key className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Lease Properties</h2>
              <p className="text-gray-400 text-sm">Rental properties from different cities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {leaseFiles.map((file, index) => (
              <motion.button
                key={file.file}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleFileClick('lease', file.file)}
                className="p-4 bg-gradient-to-br from-green-900/40 to-green-800/20 hover:from-green-800/50 hover:to-green-700/30 border border-green-600/30 hover:border-green-500/50 rounded-xl text-left transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileJson className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                  <span className="text-white font-semibold text-sm truncate">{file.name}</span>
                </div>
                <div className="text-xs text-gray-400 truncate">{file.file}</div>
                <div className="mt-2 text-xs text-green-400 font-medium">{file.city}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sale Files Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Building2 className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sale Properties</h2>
              <p className="text-gray-400 text-sm">Properties for sale from different cities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {saleFiles.map((file, index) => (
              <motion.button
                key={file.file}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleFileClick('sale', file.file)}
                className="p-4 bg-gradient-to-br from-orange-900/40 to-orange-800/20 hover:from-orange-800/50 hover:to-orange-700/30 border border-orange-600/30 hover:border-orange-500/50 rounded-xl text-left transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileJson className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                  <span className="text-white font-semibold text-sm truncate">{file.name}</span>
                </div>
                <div className="text-xs text-gray-400 truncate">{file.file}</div>
                <div className="mt-2 text-xs text-orange-400 font-medium">{file.city}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

