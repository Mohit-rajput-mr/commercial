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
  compact?: boolean; // For commercial pages - reduces height by 20%
}

export default function PropertyInquiryForm({
  propertyAddress,
  propertyId,
  formType = 'property_inquiry',
  theme = 'light',
  onSuccess,
  compact = false,
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
  const [recaptchaResetKey, setRecaptchaResetKey] = useState(0);

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
        setRecaptchaResetKey(prev => prev + 1); // Reset reCAPTCHA to trigger new challenge
        setRecaptchaToken(null);
        setIsSubmitting(false);
        return;
      }

      // Get current page URL for property link
      const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';
      
      // Send email
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          ...formData,
          propertyAddress,
          propertyId,
          propertyUrl,
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}
      >
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500' : 'bg-green-500'}`}>
          <Send className="w-6 h-6 text-white" />
        </div>
        <h3 className={`text-base font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Message Sent Successfully!
        </h3>
        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We&apos;ll get back to you within 0-4 hours.
        </p>
      </motion.div>
    );
  }

  const headerPadding = compact ? 'p-2.5' : 'p-3';
  const formPadding = compact ? 'p-2.5' : 'p-3';
  const formSpacing = compact ? 'space-y-2' : 'space-y-3';
  const textareaRows = compact ? 2 : 3;

  return (
    <div className={`rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
      {/* Header */}
      <div className={`${headerPadding} border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ask Additional Questions
        </h3>
        {/* Response Time Badge */}
        <div className={`flex items-center gap-1.5 ${compact ? 'mt-1' : 'mt-1.5'}`}>
          <Clock size={12} className={isDark ? 'text-green-400' : 'text-green-600'} />
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
            Response within 0-4 hrs
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`${formPadding} ${formSpacing}`}>
        {/* Name Field */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Name *
          </label>
          <div className="relative">
            <User size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number *
          </label>
          <div className="relative">
            <Phone size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <div className="relative">
            <Mail size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Subject
          </label>
          <div className="relative">
            <FileText size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all appearance-none ${
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
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Message
          </label>
          <div className="relative">
            <MessageSquare size={14} className={`absolute left-2.5 top-2.5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={textareaRows}
              placeholder="Tell us what you'd like to know..."
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-accent-yellow transition-all resize-none ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* reCAPTCHA */}
        <div className="flex justify-center py-1">
          <div className="scale-90 origin-center">
            <ReCaptcha 
              onVerify={handleRecaptchaVerify}
              theme={isDark ? 'dark' : 'light'}
              resetKey={recaptchaResetKey}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !recaptchaToken}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
            isSubmitting || !recaptchaToken
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-accent-yellow hover:bg-yellow-400 text-primary-black'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-black" />
              Sending...
            </>
          ) : (
            <>
              <Send size={14} />
              Submit Inquiry
            </>
          )}
        </motion.button>

        <p className={`text-[10px] text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          By submitting, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}


