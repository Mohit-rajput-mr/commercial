'use client';

import { motion } from 'framer-motion';
import BackToHomeButton from '@/components/BackToHomeButton';
import { Shield } from 'lucide-react';

export default function PrivacyNoticePage() {
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
              <Shield className="w-8 h-8 text-primary-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black">
              Privacy Notice
            </h1>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">1. Introduction</h2>
              <p>
                This Privacy Notice describes how we collect, use, and protect your personal information when you use our commercial real estate platform (&quot;Platform&quot;). We are committed to protecting your privacy and ensuring the security of your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">2. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                <li><strong>Property Preferences:</strong> Search history, saved properties, and favorite listings</li>
                <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send to us</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">4. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or respond to legal requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>With service providers who assist us in operating our Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">5. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Data portability - receive your data in a structured format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Notice, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">9. Children&apos;s Privacy</h2>
              <p>
                Our Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">10. Changes to This Privacy Notice</h2>
              <p>
                We may update our Privacy Notice from time to time. We will notify you of any changes by posting the new Privacy Notice on this page and updating the &quot;Last Updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Notice, please contact us at:
              </p>
              <p className="mt-2">
                Email: privacy@caprate.com<br />
                Address: 123 Real Estate Blvd, Miami, FL 33131<br />
                Phone: +1 (555) 123-4567
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

