// Lookups for elements and data attributes that this site's own markup always
// renders. A missing one is a markup bug, so these throw with what was missing
// instead of returning null or undefined.

export function find<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Missing element: ${selector}`);
  }
  return el;
}

export function findAll<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): Array<T> {
  return [...root.querySelectorAll<T>(selector)];
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return find<T>(`#${CSS.escape(id)}`);
}

/** A data-* attribute by its dataset key, e.g. dataValue(el, 'quickAdd') for data-quick-add. */
export function dataValue(el: HTMLElement, key: string): string {
  const value = el.dataset[key];
  if (value === undefined) {
    throw new Error(`Missing dataset.${key} on <${el.tagName.toLowerCase()}>`);
  }
  return value;
}

/** Replaces a <dl>'s contents with label and value rows from RowTemplate.astro. */
export function fillRows(dl: HTMLElement, rows: Array<[label: string, value: string]>): void {
  dl.replaceChildren(...rows.map(([label, value]) => stamp('tpl-row', { label, value })));
}

/**
 * A copy of a <template>'s content with the text of each [data-slot] filled in, so the
 * markup and its classes stay in the .astro file and scripts only supply the words.
 */
export function stamp(templateId: string, slots: Record<string, string> = {}): DocumentFragment {
  const copy = document.importNode(byId<HTMLTemplateElement>(templateId).content, true);
  for (const [name, text] of Object.entries(slots)) {
    find(`[data-slot="${name}"]`, copy).textContent = text;
  }
  return copy;
}
