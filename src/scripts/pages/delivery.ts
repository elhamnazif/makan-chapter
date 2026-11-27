// The page script of src/pages/delivery/index.astro, run before the first frame (InlineScript.astro).
import { waLink } from '../../data/site';
import { money } from '../../lib/format';
import { readCart, writeCart, totals, DELIVERY_CENTS } from '../cart';
import { fillRows, find, findAll } from '../dom';
import { toast } from '../toast';
import { validator } from '../validate';
import type { Control } from '../validate';

const items = readCart();
const t = totals(items);
const show = (sel: string, on: boolean) => (find(sel).hidden = !on);
show('[data-empty]', items.length === 0);
show('[data-filled]', items.length > 0);

fillRows(
  find('[data-lines]'),
  items.map((i) => [`${i.qty} x ${i.name}`, money(i.unitCents * i.qty)]),
);
fillRows(find('[data-totals]'), [
  ['Subtotal', money(t.subtotal)],
  ['Meal delivery', money(DELIVERY_CENTS)],
]);
find('[data-total]').textContent = money(t.total);

const form = find<HTMLFormElement>('[data-delivery]');
const check = validator(form);
const value = (name: string) => String(new FormData(form).get(name) ?? '').trim();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const bad = check(findAll<Control>('[required]', form));
  if (bad) {
    bad.focus();
    return;
  }
  const out: Array<string> = ['Hi Makan Chapter, I would like to place an order.', ''];
  for (const i of items) {
    out.push(`${i.qty} x ${i.name} (${money(i.unitCents * i.qty)})`);
    if (i.note) {
      out.push(`  Note: ${i.note}`);
    }
  }
  out.push(
    '',
    `Meal delivery: ${money(DELIVERY_CENTS)}`,
    `Total: ${money(t.total)}`,
    '',
    `Name: ${value('name')}`,
    `Email: ${value('email')}`,
    `Phone: ${value('phone')}`,
    `Address: ${value('address')}`,
  );
  if (value('notes')) {
    out.push(`Instructions: ${value('notes')}`);
  }
  if (value('marketing')) {
    out.push('Happy to receive news and promotions.');
  }
  const link = waLink(out.join('\n'));
  window.open(link, '_blank', 'noopener');
  find<HTMLAnchorElement>('[data-reopen]').href = link;
  show('[data-filled]', false);
  show('[data-sent]', true);
  find('[data-sent]').focus();
});

find('[data-clear]').addEventListener('click', () => {
  if (writeCart([])) {
    toast('Cart cleared');
  }
});
