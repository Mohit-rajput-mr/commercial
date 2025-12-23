/**
 * Utility functions to generate property URLs with bit numbers
 */

/**
 * Get commercial property URL
 * Format: /commercial/[id]
 */
export function getCommercialPropertyUrl(propertyId: string, com?: number): string {
  // com parameter is ignored - not used in URLs anymore
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

