/**
 * Calculate the final price after applying an offer percentage
 * @param price - Original price as string or number
 * @param offerPercentage - Discount percentage (0-100)
 * @returns Final price as number
 */
export function calculateDiscountedPrice(price: string | number, offerPercentage: number): number {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (offerPercentage >= 100) return 0; // Free
  return numPrice * (1 - offerPercentage / 100);
}

/**
 * Format price for display
 * @param price - Price as number
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Check if product has an active offer
 */
export function hasOffer(offerPercentage: number): boolean {
  return offerPercentage > 0;
}

/**
 * Check if product is free (100% discount)
 */
export function isFree(offerPercentage: number): boolean {
  return offerPercentage >= 100;
}
