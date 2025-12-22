'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const articles = [
  {
    id: '1',
    slug: 'future-of-office',
    title: 'The Future of Office with Nikki Greenberg',
    excerpt: 'In this episode of In the Loop, Nikki Greenberg shares how business leaders can adapt to the changing office landscape...',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  {
    id: '2',
    slug: 'types-of-commercial-real-estate',
    title: 'Types of Commercial Real Estate',
    excerpt: 'Understanding commercial properties and their investment potential',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  {
    id: '3',
    slug: 'types-of-commercial-leases',
    title: 'The 3 Most Common Types of Commercial Leases',
    excerpt: 'Understanding Gross, Net, and Percentage Lease Structures and Their Impact on Your Business...',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  },
  {
    id: '4',
    slug: 'commercial-vs-residential-investing',
    title: 'Commercial vs. Residential Real Estate Investing',
    excerpt: 'Understanding the Differences, Benefits, and Risks of Commercial and Residential Real Estate Investments...',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
];

export default function ArticlesSection() {
  const router = useRouter();
  return (
    <div className="py-20 px-5 bg-white">
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-primary-black"
          >
            Commercial Real Estate Explained
          </motion.h2>
          <button
            onClick={() => router.push('/articles')}
            className="text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors flex items-center gap-2"
          >
            More Articles <ArrowRight size={20} />
          </button>
        </div>

        {/* Articles Scroll */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4 min-w-max">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => router.push(`/articles/${article.slug}`)}
                className="w-80 bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${article.imageUrl})` }}
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-primary-black mb-3 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-custom-gray text-base line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

