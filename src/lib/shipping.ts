/**
 * Shipping rate calculation based on total item count across the cart.
 *
 * Rates:
 * - Up to 6 items: ₹120
 * - 7 to 12 items: ₹160
 * - Over 12 items: ₹160 (contact for custom shipping)
 */
export const SHIPPING_RATES = {
  UP_TO_6: 120,
  UP_TO_12: 160,
} as const;

export function calculateShipping(itemCount: number): number {
  if (itemCount <= 0) return 0;
  if (itemCount <= 6) return SHIPPING_RATES.UP_TO_6;
  return SHIPPING_RATES.UP_TO_12;
}

export function getShippingLabel(itemCount: number): string {
  if (itemCount <= 0) return '';
  if (itemCount <= 6) return 'Shipping (up to 6 items)';
  if (itemCount <= 12) return 'Shipping (up to 12 items)';
  return 'Shipping (contact for quote)';
}