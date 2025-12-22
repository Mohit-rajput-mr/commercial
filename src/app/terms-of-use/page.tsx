'use client';

import { motion } from 'framer-motion';
import BackToHomeButton from '@/components/BackToHomeButton';
import { FileText } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-light-gray pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent-yellow rounded-lg">
              <FileText className="w-8 h-8 text-primary-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black">
              Terms of Use
            </h1>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this commercial real estate platform (&quot;Platform&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on the Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the Platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">3. Property Information</h2>
              <p>
                All property information, including but not limited to prices, availability, and specifications, is provided for informational purposes only. We do not guarantee the accuracy, completeness, or timeliness of any property information. All property transactions are subject to verification and final confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">4. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">5. Prohibited Uses</h2>
              <p>You may not use the Platform:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>In any way that violates any applicable national or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate the company, employees, or other users</li>
                <li>In any way that infringes upon the rights of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">6. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are and will remain the exclusive property of the Platform and its licensors. The Platform is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">7. Disclaimer</h2>
              <p>
                The information on this Platform is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, this Platform excludes all representations, warranties, and conditions relating to our Platform and the use of this Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">8. Limitation of Liability</h2>
              <p>
                In no event shall the Platform, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <p className="mt-2">
                Email: legal@caprate.com<br />
                Address: 123 Real Estate Blvd, Miami, FL 33131
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

