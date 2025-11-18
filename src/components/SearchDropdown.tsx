'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, GraduationCap } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { LocationSuggestion } from '@/hooks/useLocationAutocomplete';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: LocationSuggestion[];
  loading: boolean;
  error: string | null;
  onSelect: (suggestion: LocationSuggestion) => void;
  triggerElement: HTMLElement | null;
}

export default function SearchDropdown({
  isOpen,
  onClose,
  suggestions,
  loading,
  error,
  onSelect,
  triggerElement,
}: SearchDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerElement) {
      const updatePosition = () => {
        const rect = triggerElement.getBoundingClientRect();
        // Use viewport coordinates for fixed positioning
        setPosition({
          top: rect.bottom + 8, // 8px gap below input
          left: rect.left,
          width: rect.width,
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, triggerElement]);

  if (typeof window === 'undefined') {
    return null;
  }

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Click-outside overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[10000]"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          />
          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[10001] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            {error && (
              <div className="px-4 py-3 text-red-600 text-sm">Error: {error}</div>
            )}
            {loading ? (
              <div className="px-4 py-3 text-custom-gray text-sm">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((s) => {
                // Icon choice & display rules
                let IconComp = s.area_type === 'school' ? GraduationCap : MapPin;
                let primary = '';
                let secondary = '';
                if (s.area_type === 'city') primary = `${s.city}, ${s.state_code}`;
                else if (s.area_type === 'neighborhood') primary = `${s.name}, ${s.city}, ${s.state_code}`;
                else if (s.area_type === 'school') {
                  primary = s.name || '';
                  secondary = `${s.city}, ${s.state_code}`;
                } else if (s.area_type === 'postal_code') primary = `${s.postal_code}, ${s.city}, ${s.state_code}`;
                else if (s.area_type === 'address') primary = s.full_address || '';
                else if (s.area_type === 'county') primary = `${s.county}, ${s.state_code}`;
                return (
                  <button
                    type="button"
                    key={s.slug_id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    onClick={() => onSelect(s)}
                    tabIndex={0}
                  >
                    <IconComp
                      size={18}
                      className={`flex-shrink-0 ${s.area_type === 'school' ? 'text-blue-500' : 'text-accent-yellow'}`}
                    />
                    <span className="font-semibold text-primary-black text-sm truncate block">
                      {primary}
                    </span>
                    {secondary && (
                      <span className="text-xs text-custom-gray block ml-2">{secondary}</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-custom-gray text-sm">No results</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dropdownContent, document.body);
}

