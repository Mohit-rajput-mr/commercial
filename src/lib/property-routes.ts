/**
 * Utility functions to generate property URLs with bit numbers
 */

/**
 * Get commercial property URL with com in path
 * Format: /commercial/com[com]/[id] or /commercial/[id] if no com
 */
export function getCommercialPropertyUrl(propertyId: string, com?: number): string {
  if (com) {
    return `/commercial/com${com}/${encodeURIComponent(propertyId)}`;
  }
  return `/commercial/${encodeURIComponent(propertyId)}`;
}

/**
 * Get residential property URL with bit in path
 * Format: /jsondetailinfo/bit[bit]?id=[propertyId] or /jsondetailinfo?id=[propertyId] if no bit
 */
export function getResidentialPropertyUrl(propertyId: string, bit?: number): string {
  if (bit) {
    return `/jsondetailinfo/bit${bit}?id=${encodeURIComponent(propertyId)}`;
  }
  return `/jsondetailinfo?id=${encodeURIComponent(propertyId)}`;
}

