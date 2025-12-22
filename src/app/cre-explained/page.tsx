'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  Building2, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  Play, 
  BookOpen,
  Home,
  DollarSign,
  Building,
  Briefcase,
  ChevronRight
} from 'lucide-react';

const articles = [
  {
    id: 'types-of-cre',
    title: 'Types of Commercial Real Estate',
    description: 'Understanding commercial properties and their investment potential',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    category: 'Fundamentals',
    readTime: '8 min read',
    content: {
      intro: 'Commercial real estate (CRE) encompasses a wide variety of property types, each with unique characteristics, tenant profiles, and investment considerations. Understanding these different types is crucial for making informed investment decisions.',
      sections: [
        {
          title: 'Office Buildings',
          icon: Building,
          content: 'Office buildings are properties designed for business activities. They range from single-tenant buildings to multi-story high-rises. Classes include Class A (premium), Class B (average), and Class C (below average). Key considerations include location, amenities, parking, and accessibility.',
        },
        {
          title: 'Retail Properties',
          icon: Briefcase,
          content: 'Retail properties include shopping centers, malls, strip centers, and standalone stores. Success depends heavily on foot traffic, anchor tenants, and location demographics. Types include neighborhood centers, community centers, regional malls, and power centers.',
        },
        {
          title: 'Industrial Properties',
          icon: Building2,
          content: 'Industrial real estate includes warehouses, distribution centers, manufacturing facilities, and flex spaces. The rise of e-commerce has dramatically increased demand for distribution and logistics facilities.',
        },
        {
          title: 'Multifamily Properties',
          icon: Home,
          content: 'Multifamily properties are residential buildings with five or more units. They range from garden-style apartments to high-rise buildings. Key metrics include cap rate, occupancy rate, and rent growth potential.',
        },
      ]
    }
  },
  {
    id: 'commercial-leases',
    title: 'The 3 Most Common Types of Commercial Leases',
    description: 'Understanding Gross, Net, and Percentage Lease Structures and Their Impact',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    category: 'Leasing',
    readTime: '10 min read',
    content: {
      intro: 'Commercial leases differ significantly from residential leases. Understanding the various lease structures is essential for both landlords and tenants to make informed decisions and negotiate effectively.',
      sections: [
        {
          title: 'Gross Lease (Full Service)',
          icon: FileText,
          content: 'In a gross lease, the tenant pays a fixed rent amount, and the landlord covers all operating expenses including property taxes, insurance, and maintenance. This provides predictability for tenants but may result in higher base rent.',
        },
        {
          title: 'Net Lease (N, NN, NNN)',
          icon: DollarSign,
          content: 'Net leases shift some or all operating expenses to the tenant. Single Net (N) covers property taxes, Double Net (NN) adds insurance, and Triple Net (NNN) includes all expenses plus maintenance. NNN leases are popular with investors for their predictable returns.',
        },
        {
          title: 'Percentage Lease',
          icon: TrendingUp,
          content: 'Common in retail, percentage leases include a base rent plus a percentage of the tenant\'s gross sales above a breakpoint. This aligns landlord and tenant interests and provides upside potential for landlords in high-performing retail locations.',
        },
      ]
    }
  },
  {
    id: 'commercial-vs-residential',
    title: 'Commercial vs. Residential Real Estate Investing',
    description: 'Understanding the Differences, Benefits, and Risks of Commercial and Residential Investment',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    category: 'Investment',
    readTime: '12 min read',
    content: {
      intro: 'Both commercial and residential real estate offer compelling investment opportunities, but they differ significantly in terms of income potential, risk profiles, management requirements, and financing options.',
      sections: [
        {
          title: 'Income Potential',
          icon: DollarSign,
          content: 'Commercial properties typically generate higher income per square foot than residential properties. However, they may have longer vacancy periods. Commercial leases are usually longer (3-10 years vs. 1 year), providing more stable cash flow.',
        },
        {
          title: 'Risk Considerations',
          icon: TrendingUp,
          content: 'Commercial properties are more sensitive to economic cycles. During recessions, businesses may close, leading to vacancies. Residential properties offer more stable demand as people always need housing. However, commercial tenants often have stronger credit profiles.',
        },
        {
          title: 'Management & Expertise',
          icon: Building2,
          content: 'Commercial real estate requires more specialized knowledge in areas like lease negotiation, tenant improvements, and market analysis. Many investors use professional property managers for commercial assets.',
        },
        {
          title: 'Financing Differences',
          icon: FileText,
          content: 'Commercial loans typically have higher down payment requirements (25-35% vs. 20%), shorter terms, and are based more on property income than borrower income. Interest rates and qualification criteria also differ significantly.',
        },
      ]
    }
  },
];

const featuredVideo = {
  title: 'The Future of Office with Nikki Greenberg',
  description: 'In this episode of In the Loop, Nikki Greenberg shares how business leaders can adapt to the changing office landscape and what the future holds for commercial real estate.',
  thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  duration: '18:32',
};

export default function CREExplainedPage() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const currentArticle = articles.find(a => a.id === selectedArticle);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[68px]"></div>

      {/* Hero Section */}
      <div className="bg-primary-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent-yellow font-semibold text-sm uppercase tracking-wider">Learn</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Commercial Real Estate <span className="text-accent-yellow">Explained</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Your comprehensive guide to understanding commercial real estate investing, leasing, and market dynamics.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!selectedArticle ? (
          <>
            {/* Featured Video Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-primary-black mb-6 flex items-center gap-2">
                <Play className="text-accent-yellow" size={24} />
                Featured Video
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={featuredVideo.thumbnail}
                      alt={featuredVideo.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 bg-accent-yellow rounded-full flex items-center justify-center"
                      >
                        <Play size={32} className="text-primary-black ml-1" fill="currentColor" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 px-2 py-1 rounded text-white text-sm">
                      {featuredVideo.duration}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="text-accent-yellow text-sm font-semibold uppercase tracking-wider">Video</span>
                    <h3 className="text-2xl font-bold text-primary-black mt-2 mb-3">{featuredVideo.title}</h3>
                    <p className="text-gray-600">{featuredVideo.description}</p>
                    <button className="mt-6 flex items-center gap-2 text-primary-black font-semibold hover:text-accent-yellow transition-colors">
                      Watch Now <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Articles Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-primary-black mb-6 flex items-center gap-2">
                <BookOpen className="text-accent-yellow" size={24} />
                More Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedArticle(article.id)}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="relative h-48">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-accent-yellow px-3 py-1 rounded-full text-xs font-bold text-primary-black">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-primary-black mb-2 group-hover:text-accent-yellow transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{article.readTime}</span>
                        <span className="text-primary-black font-semibold text-sm flex items-center gap-1 group-hover:text-accent-yellow transition-colors">
                          Read More <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 bg-primary-black rounded-2xl p-8 md:p-12 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start <span className="text-accent-yellow">Investing?</span>
              </h2>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Browse our extensive database of commercial properties for sale and lease across the United States.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/commercial-search">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-bold flex items-center gap-2 justify-center"
                  >
                    <Building2 size={20} />
                    Browse Commercial Properties
                  </motion.button>
                </Link>
                <Link href="/unified-search?location=miami">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border-2 border-white text-white rounded-lg font-bold flex items-center gap-2 justify-center hover:bg-white hover:text-primary-black transition-colors"
                  >
                    <Home size={20} />
                    Browse Residential Properties
                  </motion.button>
                </Link>
              </div>
            </motion.section>
          </>
        ) : (
          /* Article Detail View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-black mb-6 transition-colors"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Articles
            </button>

            {currentArticle && (
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg">
                {/* Article Hero */}
                <div className="relative h-64 md:h-96">
                  <Image
                    src={currentArticle.image}
                    alt={currentArticle.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <span className="bg-accent-yellow px-3 py-1 rounded-full text-xs font-bold text-primary-black">
                      {currentArticle.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
                      {currentArticle.title}
                    </h1>
                    <p className="text-gray-300 mt-2">{currentArticle.readTime}</p>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6 md:p-10 max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {currentArticle.content.intro}
                  </p>

                  <div className="space-y-8">
                    {currentArticle.content.sections.map((section, index) => {
                      const Icon = section.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          className="bg-gray-50 rounded-xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-accent-yellow/20 rounded-lg flex items-center justify-center">
                              <Icon className="text-accent-yellow" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-primary-black">{section.title}</h2>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{section.content}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Related Articles */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-primary-black mb-6">Related Articles</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {articles.filter(a => a.id !== selectedArticle).slice(0, 2).map((article) => (
                        <div
                          key={article.id}
                          onClick={() => setSelectedArticle(article.id)}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary-black text-sm">{article.title}</h4>
                            <p className="text-gray-500 text-xs mt-1">{article.readTime}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}



