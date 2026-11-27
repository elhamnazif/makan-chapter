// The page script of src/pages/cart/index.astro, run before the first frame (InlineScript.astro).
import { money } from '../../lib/format';
import { readCart, writeCart, totals, DELIVERY_CENTS } from '../cart';
import type { CartItem } from '../cart';
import { fillRows, find, stamp } from '../dom';

const list = find('[data-items]');

function update(key: string, fn: (i: CartItem) => CartItem | null) {
  writeCart(readCart().flatMap((i) => (i.key === key ? (fn(i) ?? []) : [i])));
  render();
}

function row(item: CartItem): DocumentFragment {
  const li = stamp('tpl-cart-item', {
    name: item.name,
    unit: `${money(item.unitCents)} each`,
    qty: String(item.qty),
    total: money(item.unitCents * item.qty),
  });
  const id = `note-${item.key.replaceAll(/[^a-z0-9]/gi, '')}`;
  find('[data-note-label]', li).setAttribute('for', id);
  const note = find<HTMLInputElement>('[data-note]', li);
  note.id = id;
  note.value = item.note ?? '';
  note.addEventListener('change', () =>
    update(item.key, (i) => ({ ...i, note: note.value.trim() })),
  );
  const minus = find<HTMLButtonElement>('[data-minus]', li);
  minus.setAttribute('aria-label', `Decrease ${item.name}`);
  minus.disabled = item.qty <= 1;
  minus.addEventListener('click', () => update(item.key, (i) => ({ ...i, qty: i.qty - 1 })));
  const plus = find('[data-plus]', li);
  plus.setAttribute('aria-label', `Increase ${item.name}`);
  plus.addEventListener('click', () => update(item.key, (i) => ({ ...i, qty: i.qty + 1 })));
  const remove = find('[data-remove]', li);
  remove.setAttribute('aria-label', `Remove ${item.name}`);
  remove.addEventListener('click', () => update(item.key, () => null));
  return li;
}

function render() {
  const items = readCart();
  find('[data-empty]').hidden = items.length > 0;
  find('[data-filled]').hidden = items.length === 0;
  list.replaceChildren(...items.map(row));
  const t = totals(items);
  fillRows(find('[data-totals]'), [
    ['Subtotal', money(t.subtotal)],
    ['Meal delivery', money(DELIVERY_CENTS)],
  ]);
  find('[data-total]').textContent = money(t.total);
}
render();
