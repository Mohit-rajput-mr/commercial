'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BackToHomeButton from '@/components/BackToHomeButton';
import Image from 'next/image';

const articles = [
  {
    id: '1',
    slug: 'future-of-office',
    title: 'The Future of Office with Nikki Greenberg',
    excerpt: 'In this episode of In the Loop, Nikki Greenberg shares how business leaders can adapt to the changing office landscape and create spaces that drive productivity and employee satisfaction.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    date: 'March 15, 2024',
    category: 'Office Space',
  },
  {
    id: '2',
    slug: 'types-of-commercial-real-estate',
    title: 'Types of Commercial Real Estate',
    excerpt: 'Understanding commercial properties and their investment potential. Learn about office buildings, retail spaces, industrial properties, and more.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    date: 'March 10, 2024',
    category: 'Education',
  },
  {
    id: '3',
    slug: 'types-of-commercial-leases',
    title: 'The 3 Most Common Types of Commercial Leases',
    excerpt: 'Understanding Gross, Net, and Percentage Lease Structures and Their Impact on Your Business. Make informed decisions about your commercial lease.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    date: 'March 5, 2024',
    category: 'Leasing',
  },
  {
    id: '4',
    slug: 'commercial-vs-residential-investing',
    title: 'Commercial vs. Residential Real Estate Investing',
    excerpt: 'Understanding the Differences, Benefits, and Risks of Commercial and Residential Real Estate Investments. Choose the right investment strategy for you.',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    date: 'February 28, 2024',
    category: 'Investing',
  },
  {
    id: '5',
    slug: 'cap-rate-explained',
    title: 'Understanding Cap Rates in Commercial Real Estate',
    excerpt: 'Learn how cap rates work, how to calculate them, and why they matter when evaluating commercial real estate investments.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    date: 'February 20, 2024',
    category: 'Investing',
  },
  {
    id: '6',
    slug: 'location-strategy',
    title: 'Location Strategy for Commercial Properties',
    excerpt: 'Discover the key factors that make a location ideal for commercial real estate investment and how to evaluate potential markets.',
    imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    date: 'February 15, 2024',
    category: 'Strategy',
  },
];

export default function ArticlesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-accent-yellow rounded-lg">
              <BookOpen className="w-8 h-8 text-primary-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-black">
              Commercial Real Estate Articles
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl">
            Explore our comprehensive guides and insights on commercial real estate investing, leasing, and property management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => router.push(`/articles/${article.slug}`)}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-primary-black">
                  {article.category}
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">{article.date}</div>
                <h3 className="text-xl font-bold text-primary-black mb-3 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-accent-yellow font-semibold text-sm">
                  Read More <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}














