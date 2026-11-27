// Formatting shared by the build and the browser.

/** S$ from cents: whole dollars without decimals, anything else with two (S$1,350, S$402.50). */
export function money(cents: number): string {
  const dollars = cents / 100;
  const decimals = Number.isInteger(dollars) ? 0 : 2;
  return `S$${dollars.toLocaleString('en-SG', { minimumFractionDigits: decimals, maximumFractionDigits: 2 })}`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** A date as YYYY-MM-DD in local time, the value format of <input type="date">. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Today plus n calendar days, as YYYY-MM-DD. */
export function daysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

/** YYYY-MM-DD as e.g. "Mon, 1 Dec 2026". */
export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** HH:MM (24h) as e.g. "1:30 pm". */
export function prettyTime(t: string): string {
  if (!t) {
    return '';
  }
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${pad2(m)} ${h < 12 ? 'am' : 'pm'}`;
}

/** "1 item", "2 items". */
export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
