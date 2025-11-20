'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X } from 'lucide-react';

export default function ToolsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    currentEmployees: '',
    expectedGrowth: '',
    spaceType: '',
    budget: '',
    location: '',
    moveInDate: '',
    specialRequirements: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - could send to API or show success message
    console.log('Form submitted:', formData);
    alert('Thank you! A broker will contact you soon to help determine your space needs.');
    setIsModalOpen(false);
    // Reset form
    setFormData({
      companyName: '',
      industry: '',
      currentEmployees: '',
      expectedGrowth: '',
      spaceType: '',
      budget: '',
      location: '',
      moveInDate: '',
      specialRequirements: '',
    });
  };

  return (
    <>
      <div className="py-20 px-5 bg-light-gray">
        <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="relative h-96 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all group max-w-2xl mx-auto"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-black via-primary-black/60 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8 text-white">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center mb-4"
              >
                <Calculator className="text-primary-black" size={32} />
              </motion.div>
              <h3 className="text-3xl font-bold mb-3">Determine your Space Needs</h3>
              <p className="text-lg text-gray-200 mb-6">Use our space calculator to find out how much square footage you need.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-accent-yellow text-primary-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all w-fit"
              >
                Office Space Calculator
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-primary-black">Determine Your Space Needs</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-primary-black" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-semibold text-primary-black mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      />
                    </div>

                    <div>
                      <label htmlFor="industry" className="block text-sm font-semibold text-primary-black mb-2">
                        Industry *
                      </label>
                      <input
                        type="text"
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentEmployees" className="block text-sm font-semibold text-primary-black mb-2">
                        Current Number of Employees *
                      </label>
                      <input
                        type="number"
                        id="currentEmployees"
                        name="currentEmployees"
                        value={formData.currentEmployees}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedGrowth" className="block text-sm font-semibold text-primary-black mb-2">
                        Expected Growth (Next 2 Years) *
                      </label>
                      <select
                        id="expectedGrowth"
                        name="expectedGrowth"
                        value={formData.expectedGrowth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      >
                        <option value="">Select growth</option>
                        <option value="0-10%">0-10%</option>
                        <option value="11-25%">11-25%</option>
                        <option value="26-50%">26-50%</option>
                        <option value="51-100%">51-100%</option>
                        <option value="100%+">100%+</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="spaceType" className="block text-sm font-semibold text-primary-black mb-2">
                        Space Type *
                      </label>
                      <select
                        id="spaceType"
                        name="spaceType"
                        value={formData.spaceType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      >
                        <option value="">Select space type</option>
                        <option value="Office">Office</option>
                        <option value="Retail">Retail</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Mixed Use">Mixed Use</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-semibold text-primary-black mb-2">
                        Budget Range *
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      >
                        <option value="">Select budget</option>
                        <option value="Under $5,000/month">Under $5,000/month</option>
                        <option value="$5,000 - $10,000/month">$5,000 - $10,000/month</option>
                        <option value="$10,000 - $25,000/month">$10,000 - $25,000/month</option>
                        <option value="$25,000 - $50,000/month">$25,000 - $50,000/month</option>
                        <option value="$50,000+/month">$50,000+/month</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-primary-black mb-2">
                        Preferred Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="City, State"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      />
                    </div>

                    <div>
                      <label htmlFor="moveInDate" className="block text-sm font-semibold text-primary-black mb-2">
                        Target Move-In Date *
                      </label>
                      <input
                        type="date"
                        id="moveInDate"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="specialRequirements" className="block text-sm font-semibold text-primary-black mb-2">
                      Special Requirements or Notes
                    </label>
                    <textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Parking needs, accessibility requirements, specific amenities, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 border-2 border-primary-black rounded-lg font-semibold text-primary-black hover:bg-primary-black hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
