'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    id: '1',
    question: 'Is Commercial RE Available for International Property Searches?',
    answer:
      'Yes, Commercial RE operates globally, with dedicated platforms for commercial real estate in the UK, Canada, France, and Spain. These country-specific versions offer localized commercial property listings and search capabilities.',
  },
  {
    id: '2',
    question: 'Office Space or Coworking: Which Fits Your Business Needs?',
    answer:
      'The choice between traditional office space and coworking depends on your business size, budget, and flexibility needs. Coworking offers short-term flexibility and networking opportunities, while traditional office space provides more privacy and long-term stability.',
  },
  {
    id: '3',
    question: 'What Should I Know Before Investing in Multifamily Properties?',
    answer:
      'Before investing in multifamily properties, consider location demographics, local rental rates, property condition, financing options, and potential return on investment. Research local market trends and consult with experienced real estate professionals.',
  },
];

export default function FAQSection() {
  const [activeId, setActiveId] = useState<string>('1');

  const toggleFAQ = (id: string) => {
    setActiveId(activeId === id ? '' : id);
  };

  return (
    <div className="py-20 px-5 bg-light-gray">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-black leading-tight">
              Commercial Real Estate Fundamentals: Essential Questions for Investors & Businesses
            </h2>
          </motion.div>

          {/* FAQ Items */}
          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-light-gray/50 transition-colors"
                >
                  <span className="text-lg font-semibold text-primary-black pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    {activeId === faq.id ? (
                      <ChevronUp className="text-accent-yellow" size={24} />
                    ) : (
                      <ChevronDown className="text-custom-gray" size={24} />
                    )}
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {activeId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-custom-gray text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

