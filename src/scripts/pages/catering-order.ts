// The page script of src/pages/catering/order/[menu].astro, run before the first frame (InlineScript.astro).
import { eventPackages, fees, isCbdOrSentosa, menuBySlug, quote } from '../../data/eventCatering';
import type { PackageKey } from '../../data/eventCatering';
import { daysFromToday, money, prettyDate, prettyTime } from '../../lib/format';
import { dataValue, fillRows, find, findAll, stamp } from '../dom';
import { showMessage, validator } from '../validate';
import type { Control } from '../validate';

const form = find<HTMLFormElement>('[data-order]');
const menu = menuBySlug(dataValue(form, 'menu'));
const sections = findAll('[data-step]', form);
const progress = findAll<HTMLButtonElement>('[data-goto]');
const back = find<HTMLButtonElement>('[data-back]');
const next = find<HTMLButtonElement>('[data-next]');
const field = (id: string) => find<HTMLInputElement>(`#${id}`, form);
const value = (id: string) => find<Control>(`#${id}`, form).value.trim();
const pax = field('pax');
const date = field('date');
const deliveryTime = field('delivery-time');
const readyTime = field('ready-time');
const teardownTime = field('teardown-time');
const postal = field('postal');
const LAST = sections.length;
let step = 1;
let reached = 1;

// Earliest bookable date: today plus the lead time, in calendar days.
date.min = daysFromToday(fees.leadDays);
date.dataset.under = `Please book at least ${fees.leadDays} days ahead. The earliest date is ${prettyDate(date.min)}.`;
find('[data-date-help]').textContent =
  `Book at least ${fees.leadDays} days ahead. Earliest date: ${prettyDate(date.min)}.`;

const check = validator(form, {
  'teardown-time': (el) =>
    readyTime.value && el.value <= readyTime.value
      ? 'Teardown must be after the food is ready.'
      : '',
});

const pkg = () => {
  const key = form.querySelector<HTMLInputElement>('input[name="package"]:checked')?.value;
  return key === 'mini' || key === 'classic' ? eventPackages[key] : null;
};
const visibleCategories = () =>
  findAll<HTMLFieldSetElement>('[data-category]', form).filter((f) => !f.hidden);
// The step's required controls, leaving out fields for the other package.
const stepControls = (n: number) =>
  findAll<Control>('[required]', sections[n - 1]).filter((c) => !c.closest('[data-only][hidden]'));

const paxMessages: Record<PackageKey, { under: string; over: string }> = {
  mini: {
    under: `${eventPackages.mini.name} starts from ${eventPackages.mini.minPax} pax.`,
    over: `${eventPackages.mini.name} is for up to ${eventPackages.mini.maxPax} pax. For more guests, choose ${eventPackages.classic.name}.`,
  },
  classic: {
    under: `${eventPackages.classic.name} starts from ${eventPackages.classic.minPax} pax. For fewer guests, choose ${eventPackages.mini.name}.`,
    over: `Online orders are for up to ${eventPackages.classic.maxPax} pax. For more, WhatsApp us for bulk terms.`,
  },
};

function groupError(el: HTMLElement, message: string) {
  el.textContent = message;
  el.hidden = !message;
}

// Package switch: show the matching dishes and event fields, keep pax inside the package's range.
function applyPackage() {
  const p = pkg();
  findAll('[data-only]', form).forEach((el) => {
    el.hidden = Boolean(el.dataset.only && el.dataset.only !== p?.key);
  });
  if (!p) {
    return;
  }
  pax.min = String(p.minPax);
  if (p.maxPax) {
    pax.max = String(p.maxPax);
  } else {
    pax.removeAttribute('max');
  }
  const n = Number(pax.value);
  if (!pax.value || n < p.minPax) {
    pax.value = String(p.minPax);
  } else if (p.maxPax && n > p.maxPax) {
    pax.value = String(p.maxPax);
  }
  Object.assign(pax.dataset, { ...paxMessages[p.key], missing: paxMessages[p.key].under });
  find('[data-pax-help]').textContent = p.maxPax
    ? `${p.name}: ${p.minPax} to ${p.maxPax} pax.`
    : `${p.name}: minimum ${p.minPax} pax.`;
  showMessage(pax, '');
}

const currentQuote = () => {
  const p = pkg();
  return p
    ? quote(menu, p, {
        pax: Number(pax.value) || 0,
        postal: postal.value.trim(),
        teardownTime: teardownTime.value,
      })
    : null;
};

function fillLines(dl: HTMLElement, totalLabel: string) {
  const p = pkg();
  const q = currentQuote();
  const rows: Array<[string, string]> = [['Menu', menu.name]];
  if (p && q) {
    rows.push(
      ['Package', p.name],
      ...q.lines.map((l): [string, string] => [l.label, (l.extra ? '+' : '') + money(l.cents)]),
    );
  }
  fillRows(dl, rows);
  dl.append(stamp('tpl-total-row', { label: totalLabel, value: money(q?.totalCents ?? 0) }));
}

function render() {
  for (const f of visibleCategories()) {
    const picked = f.querySelector<HTMLInputElement>('input:checked');
    find('[data-status]', f).textContent = picked
      ? `Chosen: ${picked.value}`
      : `Choose 1 of ${f.querySelectorAll('input').length}`;
    if (picked) {
      groupError(find('[data-cat-error]', f), '');
    }
  }
  find('[data-postal-help]').textContent = isCbdOrSentosa(postal.value.trim())
    ? `CBD or Sentosa delivery: ${money(fees.cbdSentosaCents)} added to your total.`
    : `Delivery to the CBD or Sentosa adds ${money(fees.cbdSentosaCents)}.`;
  fillLines(find('[data-summary-lines]'), 'Total due now');
  find('[data-total]').textContent = money(currentQuote()?.totalCents ?? 0);
}

// Shows every message in a step and returns its first invalid control.
function validate(n: number): HTMLElement | null {
  let first: HTMLElement | null = null;
  if (n === 1) {
    const missing = !pkg();
    groupError(find('#package-error'), missing ? 'Choose Mini Catering or Classic Catering.' : '');
    if (missing) {
      first = find('input[name="package"]', form);
    }
  }
  if (n === 2) {
    for (const f of visibleCategories()) {
      const missing = !f.querySelector('input:checked');
      groupError(
        find('[data-cat-error]', f),
        missing ? `Choose 1 ${dataValue(f, 'category').toLowerCase()} dish.` : '',
      );
      if (missing) {
        first ??= find('input', f);
      }
    }
  }
  const badField = check(stepControls(n));
  return first ?? badField;
}

function reviewCard(title: string, rows: Array<[string, string]>, editStep: number) {
  const card = stamp('tpl-review-card', { title });
  const edit = find('[data-edit]', card);
  edit.setAttribute('aria-label', `Change ${title.toLowerCase()}`);
  edit.addEventListener('click', () => go(editStep));
  find('[data-rows]', card).append(
    ...rows.flatMap(([label, text]) =>
      text ? [stamp('tpl-review-row', { label, value: text })] : [],
    ),
  );
  return card;
}

function when(): string {
  const p = pkg();
  if (!date.value || !p) {
    return '';
  }
  return p.key === 'mini'
    ? `${prettyDate(date.value)}, delivery at ${prettyTime(deliveryTime.value)}`
    : `${prettyDate(date.value)}, food ready by ${prettyTime(readyTime.value)}, teardown at ${prettyTime(teardownTime.value)}`;
}

function renderReview() {
  const p = pkg();
  if (!p) {
    return;
  }
  const dishes = visibleCategories().map((f): [string, string] => [
    dataValue(f, 'category'),
    f.querySelector<HTMLInputElement>('input:checked')?.value ?? '',
  ]);
  find('[data-review]').replaceChildren(
    reviewCard(
      'Package and pax',
      [
        ['Menu', menu.name],
        ['Package', p.name],
        ['Pax', pax.value],
      ],
      1,
    ),
    reviewCard('Dishes', dishes, 2),
    reviewCard('Event', [['Date and time', when()]], 3),
    reviewCard(
      'Contact and delivery',
      [
        ['Name', value('name')],
        ['Mobile', value('phone')],
        ['Email', value('email')],
        ['Address', `${value('address')}, Singapore ${value('postal')}`],
        ['Remarks', value('remarks')],
      ],
      4,
    ),
  );
  fillLines(find('[data-review-lines]'), 'Total due now');
}

function go(n: number, initial = false) {
  step = n;
  reached = Math.max(reached, n);
  sections.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
  progress.forEach((b) => {
    const i = Number(b.dataset.goto);
    b.dataset.state = i === n ? 'current' : i <= reached ? 'done' : 'todo';
    b.disabled = i > reached;
    if (i === n) {
      b.setAttribute('aria-current', 'step');
    } else {
      b.removeAttribute('aria-current');
    }
  });
  back.hidden = n === 1;
  find('[data-next-label]').textContent = n === LAST ? 'Pay now: full payment' : 'Next';
  find('[data-next-icon]').classList.toggle('hidden', n === LAST);
  if (n === LAST) {
    renderReview();
  }
  render();
  if (initial) {
    return;
  }
  find('[data-progress]').scrollIntoView({ block: 'start', behavior: 'instant' });
  find('h2', sections[n - 1]).focus({ preventScroll: true });
}

function pay() {
  // Re-check every step before taking payment.
  for (let i = 1; i <= LAST; i++) {
    const bad = validate(i);
    if (bad) {
      if (i !== step) {
        go(i);
      }
      bad.focus();
      return;
    }
  }
  next.disabled = true;
  find('[data-next-label]').textContent = 'Processing payment...';
  window.setTimeout(() => {
    find('[data-ref]').textContent = `MC-${String(Date.now()).slice(-6)}`;
    find('[data-done-name]').textContent = field('name').value.trim().split(' ')[0];
    find('[data-done-email]').textContent = field('email').value.trim();
    const done = find('[data-done-lines]');
    fillLines(done, 'Amount paid');
    done.prepend(stamp('tpl-row', { label: 'When', value: when() }));
    find('[data-layout]').hidden = true;
    find('[data-progress]').hidden = true;
    find('[data-title]').textContent = `${menu.name}: order placed`;
    find('[data-confirmation]').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    find('#done-title').focus({ preventScroll: true });
  }, 1200);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (step === LAST) {
    pay();
    return;
  }
  const bad = validate(step);
  if (bad) {
    bad.focus();
    return;
  }
  go(step + 1);
});
back.addEventListener('click', () => go(step - 1));
progress.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.goto))));
findAll<HTMLButtonElement>('[data-pax-step]').forEach((b) =>
  b.addEventListener('click', () => {
    const p = pkg();
    if (!p) {
      return;
    }
    const v = (Number(pax.value) || p.minPax) + Number(b.dataset.paxStep);
    pax.value = String(Math.max(p.minPax, p.maxPax ? Math.min(p.maxPax, v) : v));
    showMessage(pax, '');
    render();
  }),
);
form.addEventListener('change', (e) => {
  if (e.target !== null && 'name' in e.target && e.target.name === 'package') {
    applyPackage();
    groupError(find('#package-error'), '');
  }
  render();
});
form.addEventListener('input', render);
find('[data-terms-link]').addEventListener('click', () => {
  find<HTMLDetailsElement>('#terms-text').open = true;
});

applyPackage();
go(1, true);
