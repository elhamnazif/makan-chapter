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
