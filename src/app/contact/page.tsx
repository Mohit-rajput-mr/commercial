'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Clock, User, MessageSquare, FileText } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import ReCaptcha from '@/components/ReCaptcha';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaResetKey, setRecaptchaResetKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA first
      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const recaptchaResult = await recaptchaResponse.json();

      if (!recaptchaResult.success) {
        setError('reCAPTCHA verification failed. Please try again.');
        setRecaptchaResetKey(prev => prev + 1); // Reset reCAPTCHA to trigger new challenge
        setRecaptchaToken(null);
        setIsSubmitting(false);
        return;
      }

      // Send email
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'contact',
          ...formData,
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        setSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
          setSubmitted(false);
          setRecaptchaToken(null);
        }, 5000);
      } else {
        setError(emailResult.error || 'Failed to send message. Please try again.');
        setRecaptchaResetKey(prev => prev + 1); // Reset reCAPTCHA on error
        setRecaptchaToken(null);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred. Please try again.');
      setRecaptchaResetKey(prev => prev + 1); // Reset reCAPTCHA on error
      setRecaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-secondary-black to-primary-black pt-24 pb-16 px-4">
      <BackToHomeButton />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get In <span className="text-accent-yellow">Touch</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions about our platform? We&apos;re here to help you find the perfect property.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your request has been submitted successfully.</h3>
                  <p className="text-gray-300">Our team will contact you as soon as possible. Thank you for your request!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-yellow transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-yellow transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-yellow transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent-yellow transition-colors appearance-none"
                      >
                        <option value="" className="bg-primary-black">Select a subject</option>
                        <option value="General Inquiry" className="bg-primary-black">General Inquiry</option>
                        <option value="Property Information" className="bg-primary-black">Property Information</option>
                        <option value="Technical Support" className="bg-primary-black">Technical Support</option>
                        <option value="Partnership Opportunities" className="bg-primary-black">Partnership Opportunities</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Message *
                    </label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-yellow transition-colors resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="flex justify-center py-2">
                    <ReCaptcha 
                      onVerify={handleRecaptchaVerify}
                      theme="dark"
                      resetKey={recaptchaResetKey}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !recaptchaToken}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                      isSubmitting || !recaptchaToken
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : 'bg-accent-yellow text-primary-black hover:bg-yellow-400'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-black" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-400 text-center">
                    By submitting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
