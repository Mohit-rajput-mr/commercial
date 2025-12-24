'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import Image from 'next/image';

const articlesData: Record<string, any> = {
  'future-of-office': {
    title: 'The Future of Office with Nikki Greenberg',
    content: `
      <p>The commercial real estate landscape is evolving rapidly, and office spaces are at the forefront of this transformation. In this comprehensive guide, we explore the future of office spaces with insights from industry expert Nikki Greenberg.</p>
      
      <h2>The Changing Office Landscape</h2>
      <p>Traditional office spaces are being reimagined to meet the needs of modern businesses. The shift towards flexible work arrangements has fundamentally changed how companies approach office design and utilization.</p>
      
      <h2>Key Trends Shaping Office Spaces</h2>
      <ul>
        <li><strong>Hybrid Work Models:</strong> Companies are adopting flexible schedules that combine remote and in-office work</li>
        <li><strong>Collaborative Spaces:</strong> Open floor plans with designated collaboration areas</li>
        <li><strong>Wellness-Focused Design:</strong> Emphasis on natural light, air quality, and ergonomic furniture</li>
        <li><strong>Technology Integration:</strong> Smart building systems and IoT devices</li>
      </ul>
      
      <h2>Investment Considerations</h2>
      <p>When evaluating office properties, consider factors such as location, building amenities, technology infrastructure, and potential for future modifications. Properties that can adapt to changing tenant needs will maintain higher value.</p>
      
      <h2>Conclusion</h2>
      <p>The future of office spaces lies in flexibility, technology, and employee well-being. Investors and tenants who embrace these trends will be better positioned for success in the evolving commercial real estate market.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    date: 'March 15, 2024',
    category: 'Office Space',
    author: 'Nikki Greenberg',
  },
  'types-of-commercial-real-estate': {
    title: 'Types of Commercial Real Estate',
    content: `
      <p>Commercial real estate encompasses a wide variety of property types, each with unique characteristics, investment potential, and market dynamics.</p>
      
      <h2>Office Buildings</h2>
      <p>Office buildings range from single-tenant properties to large multi-tenant complexes. They can be classified as Class A (premium), Class B (mid-range), or Class C (basic).</p>
      
      <h2>Retail Properties</h2>
      <p>Retail properties include shopping centers, strip malls, standalone stores, and mixed-use developments. Location and foot traffic are critical factors for retail success.</p>
      
      <h2>Industrial Properties</h2>
      <p>Industrial real estate includes warehouses, distribution centers, manufacturing facilities, and flex spaces. The rise of e-commerce has increased demand for logistics properties.</p>
      
      <h2>Multifamily Properties</h2>
      <p>Multifamily properties include apartment buildings, condominiums, and townhomes. They offer steady cash flow and are considered relatively stable investments.</p>
      
      <h2>Hospitality Properties</h2>
      <p>Hotels, motels, and other hospitality properties require active management but can provide strong returns in the right markets.</p>
      
      <h2>Specialty Properties</h2>
      <p>This category includes healthcare facilities, data centers, self-storage, and other specialized property types with unique operational requirements.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    date: 'March 10, 2024',
    category: 'Education',
    author: 'Commercial Real Estate Team',
  },
  'types-of-commercial-leases': {
    title: 'The 3 Most Common Types of Commercial Leases',
    content: `
      <p>Understanding commercial lease structures is essential for both landlords and tenants. The three most common types are Gross, Net, and Percentage leases.</p>
      
      <h2>Gross Lease (Full Service Lease)</h2>
      <p>In a gross lease, the tenant pays a fixed rent amount, and the landlord covers all operating expenses including property taxes, insurance, and maintenance. This is the simplest structure for tenants but typically results in higher base rent.</p>
      
      <h2>Net Lease</h2>
      <p>Net leases require tenants to pay base rent plus a portion of operating expenses. There are three variations:</p>
      <ul>
        <li><strong>Single Net (N):</strong> Tenant pays rent + property taxes</li>
        <li><strong>Double Net (NN):</strong> Tenant pays rent + property taxes + insurance</li>
        <li><strong>Triple Net (NNN):</strong> Tenant pays rent + property taxes + insurance + maintenance</li>
      </ul>
      
      <h2>Percentage Lease</h2>
      <p>Common in retail, percentage leases combine a base rent with a percentage of the tenant's gross sales. This structure aligns landlord and tenant interests and is often used for retail properties.</p>
      
      <h2>Choosing the Right Lease Structure</h2>
      <p>The best lease structure depends on property type, market conditions, and the financial situation of both parties. Consult with a commercial real estate professional to determine the most appropriate structure for your situation.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    date: 'March 5, 2024',
    category: 'Leasing',
    author: 'Legal & Leasing Team',
  },
  'commercial-vs-residential-investing': {
    title: 'Commercial vs. Residential Real Estate Investing',
    content: `
      <p>Both commercial and residential real estate offer investment opportunities, but they differ significantly in terms of risk, return, and management requirements.</p>
      
      <h2>Key Differences</h2>
      
      <h3>Income Potential</h3>
      <p>Commercial properties typically offer higher rental yields and longer lease terms, providing more stable cash flow. Residential properties may have higher vacancy rates but can appreciate faster in certain markets.</p>
      
      <h3>Capital Requirements</h3>
      <p>Commercial properties generally require larger down payments (20-30%) and higher initial capital. Residential properties can be purchased with smaller down payments (5-20%).</p>
      
      <h3>Management Complexity</h3>
      <p>Commercial properties often require more active management and specialized knowledge. Residential properties are generally easier to manage but may require more frequent tenant turnover.</p>
      
      <h3>Market Dynamics</h3>
      <p>Commercial real estate values are closely tied to business performance and economic conditions. Residential values are more influenced by demographic trends and local housing markets.</p>
      
      <h2>Which is Right for You?</h2>
      <p>Consider your investment goals, available capital, risk tolerance, and management capabilities when choosing between commercial and residential investments. Many successful investors diversify across both asset classes.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    date: 'February 28, 2024',
    category: 'Investing',
    author: 'Investment Advisory Team',
  },
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const article = articlesData[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
        <BackToHomeButton />
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold text-primary-black mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/articles')}
            className="px-6 py-3 bg-accent-yellow text-primary-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-4xl mx-auto">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Hero Image */}
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span>{article.category}</span>
              </div>
              {article.author && (
                <div>
                  <span>By {article.author}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-6">
              {article.title}
            </h1>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.article>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/articles')}
          className="mt-8 flex items-center gap-2 text-primary-black font-semibold hover:text-accent-yellow transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </motion.button>
      </div>
    </div>
  );
}





