'use client';

import { motion } from 'framer-motion';
import { Calculator, Building2, Ruler, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SmartSpaceEstimationTool() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to the advanced space calculator page
    router.push('/space-calculator');
  };

  return (
    <div className="relative py-20 md:py-32 px-5 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-black/90 via-primary-black/80 to-primary-black/70" />
      </div>

      <div className="relative z-10 max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <Calculator className="w-5 h-5 text-accent-yellow" />
              <span className="text-sm font-semibold text-accent-yellow">Smart Tool</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Smart Space Estimation Tool
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
            >
              Calculate your ideal commercial space requirements with our intelligent estimation tool. 
              Get accurate recommendations based on your business needs, team size, and growth projections.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-yellow/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Accurate Calculations</h3>
                  <p className="text-white/80">Get precise space requirements based on industry standards and best practices.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-yellow/20 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Customizable Parameters</h3>
                  <p className="text-white/80">Adjust for your specific needs, team size, and future growth plans.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-yellow/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Growth Planning</h3>
                  <p className="text-white/80">Factor in expansion plans and scalability requirements.</p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="inline-flex items-center gap-3 bg-accent-yellow text-primary-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl"
            >
              <Calculator className="w-5 h-5" />
              Get Started
            </motion.button>
          </motion.div>

          {/* Right Side - Visual Element or Form Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm mb-2">Business Type</div>
                  <div className="text-white text-lg font-semibold">Office Space</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm mb-2">Team Size</div>
                  <div className="text-white text-lg font-semibold">25-50 employees</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm mb-2">Estimated Space</div>
                  <div className="text-accent-yellow text-2xl font-bold">5,000 - 7,500 sq ft</div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="text-white/80 text-sm">
                    Based on industry standards and your requirements
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

