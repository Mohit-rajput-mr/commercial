'use client';

import { useState } from 'react';
import { parsePropertyDescription, ParsedPropertyDetails } from '@/lib/property-description-parser';
import { Home, Car, Building2, GraduationCap, DollarSign, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PropertyDetailsSectionsProps {
  description: string;
}

const sectionIcons = {
  overview: Home,
  interior: Home,
  exterior: Building2,
  parking: Car,
  hoa: Building2,
  schools: GraduationCap,
  taxes: DollarSign,
  other: Info,
};

export default function PropertyDetailsSections({ description }: PropertyDetailsSectionsProps) {
  const parsed = parsePropertyDescription(description);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    { key: 'overview' as const, data: parsed.overview },
    { key: 'interior' as const, data: parsed.interior },
    { key: 'exterior' as const, data: parsed.exterior },
    { key: 'parking' as const, data: parsed.parking },
    { key: 'hoa' as const, data: parsed.hoa },
    { key: 'schools' as const, data: parsed.schools },
    { key: 'taxes' as const, data: parsed.taxes },
    { key: 'other' as const, data: parsed.other },
  ].filter(section => section.data.items.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3 md:space-y-4 lg:space-y-6">
      {sections.map(({ key, data }) => {
        const Icon = sectionIcons[key];
        const isOverview = key === 'overview';
        const isExpanded = isOverview || expandedSections.has(key);

        return (
          <div
            key={key}
            className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Section Header - Clickable for non-overview sections */}
            <button
              onClick={() => !isOverview && toggleSection(key)}
              disabled={isOverview}
              className={`w-full flex items-center justify-between p-3 md:p-4 lg:p-6 ${
                !isOverview ? 'hover:bg-gray-100 transition-colors cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Icon size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6 text-accent-yellow flex-shrink-0" />
                <h3 className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-primary-black text-left truncate">
                  {data.title}
                </h3>
                {!isOverview && data.items.length > 0 && (
                  <span className="text-xs md:text-sm text-custom-gray bg-white px-2 py-0.5 rounded-full flex-shrink-0">
                    {data.items.length}
                  </span>
                )}
              </div>
              {!isOverview && (
                <div className="flex-shrink-0 ml-2 md:ml-4">
                  {isExpanded ? (
                    <ChevronUp size={18} className="md:w-5 md:h-5 text-custom-gray" />
                  ) : (
                    <ChevronDown size={18} className="md:w-5 md:h-5 text-custom-gray" />
                  )}
                </div>
              )}
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="px-3 md:px-4 lg:px-6 pb-3 md:pb-4 lg:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                  {data.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col p-2 md:p-3 bg-white rounded-md border border-gray-100 hover:border-gray-300 transition-colors"
                    >
                      <span className="text-xs md:text-sm text-custom-gray mb-1 md:mb-1.5 font-medium">
                        {item.label}
                      </span>
                      <span className="text-xs md:text-sm lg:text-base font-semibold text-primary-black break-words leading-relaxed">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

