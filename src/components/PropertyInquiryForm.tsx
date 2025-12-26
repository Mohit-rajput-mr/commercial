'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, User, Phone, Mail, MessageSquare, FileText } from 'lucide-react';
import ReCaptcha from './ReCaptcha';

interface PropertyInquiryFormProps {
  propertyAddress?: string;
  propertyId?: string;
  formType?: 'property_inquiry' | 'contact' | 'registration';
  theme?: 'light' | 'dark';
  onSuccess?: () => void;
}

export default function PropertyInquiryForm({
  propertyAddress,
  propertyId,
  formType = 'property_inquiry',
  theme = 'light',
  onSuccess,
}: PropertyInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: propertyAddress 
      ? `I am interested in the property at ${propertyAddress}. Please provide more information.`
      : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
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
        setIsSubmitting(false);
        return;
      }

      // Send email
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          ...formData,
          propertyAddress,
          propertyId,
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        setSubmitted(true);
        onSuccess?.();
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            phone: '',
            email: '',
            subject: '',
            message: '',
          });
          setSubmitted(false);
          setRecaptchaToken(null);
        }, 5000);
      } else {
        setError(emailResult.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-xl text-center ${isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}
      >
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500' : 'bg-green-500'}`}>
          <Send className="w-8 h-8 text-white" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Message Sent Successfully!
        </h3>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          We&apos;ll get back to you within 0-4 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ask Additional Questions
        </h3>
        {/* Response Time Badge */}
        <div className="flex items-center gap-2 mt-2">
          <Clock size={14} className={isDark ? 'text-green-400' : 'text-green-600'} />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
            Response within 0-4 hrs
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Name Field */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Name *
          </label>
          <div className="relative">
            <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number *
          </label>
          <div className="relative">
            <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <div className="relative">
            <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Subject
          </label>
          <div className="relative">
            <FileText size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all appearance-none ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="" className={isDark ? 'bg-gray-800' : ''}>Select a subject</option>
              <option value="Property Tour Request" className={isDark ? 'bg-gray-800' : ''}>Property Tour Request</option>
              <option value="Pricing Information" className={isDark ? 'bg-gray-800' : ''}>Pricing Information</option>
              <option value="Availability" className={isDark ? 'bg-gray-800' : ''}>Availability</option>
              <option value="Financing Options" className={isDark ? 'bg-gray-800' : ''}>Financing Options</option>
              <option value="General Inquiry" className={isDark ? 'bg-gray-800' : ''}>General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Message
          </label>
          <div className="relative">
            <MessageSquare size={18} className={`absolute left-3 top-3 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us what you'd like to know..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all resize-none ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* reCAPTCHA */}
        <div className="flex justify-center py-2">
          <ReCaptcha 
            onVerify={handleRecaptchaVerify}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !recaptchaToken}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isSubmitting || !recaptchaToken
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-accent-yellow hover:bg-yellow-400 text-primary-black'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-black" />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Inquiry
            </>
          )}
        </motion.button>

        <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          By submitting, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}


