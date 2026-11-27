// Client-side cart. Stored in localStorage; nothing is sent anywhere until the
// customer chooses to open WhatsApp with the prepared order message.
export type CartKind = 'buffet' | 'meal' | 'gift';

export interface CartItem {
  key: string;
  kind: CartKind;
  id: string;
  name: string;
  unitCents: number;
  unitLabel: string;
  qty: number;
  details: Array<string>;
  note?: string;
}

const KEY = 'mc-cart-v1';
const DRAFT = 'mc-draft-v1';

export const DELIVERY_CENTS: Record<CartKind, number> = { buffet: 3000, meal: 1500, gift: 0 };
export const KIND_LABEL: Record<CartKind, string> = { buffet: 'Mini buffet', meal: 'Meals and kuih', gift: 'Gift cards' };
export const DELIVERY_LABEL: Record<CartKind, string> = { buffet: 'Mini buffet delivery', meal: 'Meal delivery', gift: '' };

const isStrings = (v: unknown): v is Array<string> => Array.isArray(v) && v.every((s) => typeof s === 'string');

// Storage is outside the app's control, so check its shape before trusting it.
// JSON has no undefined, so an optional field is either absent or of its type.
function isCartItem(v: unknown): v is CartItem {
  return typeof v === 'object' && v !== null
    && 'key' in v && typeof v.key === 'string'
    && 'kind' in v && typeof v.kind === 'string' && Object.hasOwn(DELIVERY_CENTS, v.kind)
    && 'id' in v && typeof v.id === 'string'
    && 'name' in v && typeof v.name === 'string'
    && 'unitLabel' in v && typeof v.unitLabel === 'string'
    && 'unitCents' in v && typeof v.unitCents === 'number'
    && 'qty' in v && typeof v.qty === 'number'
    && 'details' in v && isStrings(v.details)
    && (!('note' in v) || typeof v.note === 'string');
}

function isDraft(v: unknown): v is Draft {
  return typeof v === 'object' && v !== null
    && 'slug' in v && typeof v.slug === 'string'
    && (!('date' in v) || typeof v.date === 'string')
    && (!('time' in v) || typeof v.time === 'string')
    && (!('qty' in v) || typeof v.qty === 'number')
    && (!('setup' in v) || typeof v.setup === 'boolean')
    && (!('choices' in v) || (typeof v.choices === 'object' && v.choices !== null && Object.values(v.choices).every(isStrings)));
}

export function readCart(): Array<CartItem> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(isCartItem) : [];
  } catch { return []; }
}

export function writeCart(items: Array<CartItem>): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('cart:change'));
}

export function addItem(item: Omit<CartItem, 'key'> & { key?: string }): void {
  const items = readCart();
  const key = item.key ?? `${item.id}:${item.details.join('|')}`;
  const existing = items.find((i) => i.key === key);
  if (existing) { existing.qty += item.qty; }
  else { items.push({ ...item, key }); }
  writeCart(items);
}

export function cartCount(): number {
  return readCart().reduce((n, i) => n + i.qty, 0);
}

export function groups(items: Array<CartItem>) {
  const kinds: Array<CartKind> = ['buffet', 'meal', 'gift'];
  return kinds.flatMap((kind) => {
    const list = items.filter((i) => i.kind === kind);
    if (!list.length) { return []; }
    const subtotal = list.reduce((s, i) => s + i.unitCents * i.qty, 0);
    return [{ kind, list, subtotal, delivery: DELIVERY_CENTS[kind] }];
  });
}

export function totals(items: Array<CartItem>) {
  const gs = groups(items);
  const subtotal = gs.reduce((s, g) => s + g.subtotal, 0);
  const delivery = gs.reduce((s, g) => s + g.delivery, 0);
  return { subtotal, delivery, total: subtotal + delivery };
}

export function money(cents: number): string {
  const v = cents / 100;
  return `S$${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}`;
}

export interface Draft {
  slug: string;
  date?: string;
  time?: string;
  qty?: number;
  choices?: Record<string, Array<string>>;
  setup?: boolean;
}

export function readDraft(): Draft | null {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(DRAFT) || 'null');
    return isDraft(stored) ? stored : null;
  } catch { return null; }
}
export function writeDraft(d: Draft): void { sessionStorage.setItem(DRAFT, JSON.stringify(d)); }
export function clearDraft(): void { sessionStorage.removeItem(DRAFT); }

export function waUrl(text: string): string {
  return `https://wa.me/6596865290?text=${encodeURIComponent(text)}`;
}

export function base(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Earliest selectable date as YYYY-MM-DD in local time. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function toast(message: string): void {
  const region = document.getElementById('toast');
  if (!region) { return; }
  region.textContent = message;
  region.dataset.show = 'true';
  window.clearTimeout(Number(region.dataset.timer));
  region.dataset.timer = String(window.setTimeout(() => { region.dataset.show = 'false'; }, 2600));
}
