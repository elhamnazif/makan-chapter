// The cart's storage key and its headline numbers. Used by scripts/cart.ts, and by the inline
// script in Layout.astro that paints the numbers before the first frame. That script is built
// from this function's own source, so cartNumbers must stay self-contained: no imports and
// nothing from the module scope.

export const CART_KEY = 'mc-cart-v2';

/** Item count and subtotal (in cents) of what is in storage. Malformed entries count as nothing. */
export function cartNumbers(stored: unknown) {
  let count = 0;
  let cents = 0;
  for (const item of Array.isArray(stored) ? (stored as Array<unknown>) : []) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'qty' in item &&
      typeof item.qty === 'number' &&
      'unitCents' in item &&
      typeof item.unitCents === 'number'
    ) {
      count += item.qty;
      cents += item.unitCents * item.qty;
    }
  }
  return { count, cents };
}
