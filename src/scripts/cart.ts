// Client-side cart for Order Online. Stored in localStorage; nothing is sent anywhere until
// the customer chooses to open WhatsApp with the prepared order message.
import { deliveryFeeCents } from '../data/catalogue.json';
import { toast } from './toast';

export interface CartItem {
  /** id, plus the note when there is one: the same dish with a different note is its own line. */
  key: string;
  id: string;
  name: string;
  unitCents: number;
  qty: number;
  note?: string;
}

const KEY = 'mc-cart-v2';

export const DELIVERY_CENTS = deliveryFeeCents;

// Storage is outside the app's control, so check its shape before trusting it.
// JSON has no undefined, so an optional field is either absent or of its type.
function isCartItem(v: unknown): v is CartItem {
  return (
    typeof v === 'object' &&
    v !== null &&
    'key' in v &&
    typeof v.key === 'string' &&
    'id' in v &&
    typeof v.id === 'string' &&
    'name' in v &&
    typeof v.name === 'string' &&
    'unitCents' in v &&
    typeof v.unitCents === 'number' &&
    'qty' in v &&
    typeof v.qty === 'number' &&
    (!('note' in v) || typeof v.note === 'string')
  );
}

export function readCart(): Array<CartItem> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

/** Saves the cart and tells the page. False when the browser blocks storage. */
export function writeCart(items: Array<CartItem>): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    toast('Your browser blocked saving the cart. Allow site data for this site and try again.');
    return false;
  }
  document.dispatchEvent(new CustomEvent('cart:change'));
  return true;
}

export function addItem(item: Omit<CartItem, 'key'>): boolean {
  const items = readCart();
  const key = item.note ? `${item.id}:${item.note}` : item.id;
  const existing = items.find((i) => i.key === key);
  if (existing) {
    existing.qty += item.qty;
  } else {
    items.push({ ...item, key });
  }
  return writeCart(items);
}

export function totals(items: Array<CartItem>) {
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const delivery = items.length ? DELIVERY_CENTS : 0;
  return { count, subtotal, delivery, total: subtotal + delivery };
}
