// Short confirmations such as "added to cart", whose result also shows elsewhere (the cart
// badge). #toast in Layout.astro is a manual popover: clicks elsewhere leave it open, and it
// hides itself after a few seconds unless focus is inside it.
import { find } from './dom';

const HIDE_AFTER_MS = 5000;
let timer = 0;
let returnFocusTo: HTMLElement | null = null;

const isElement = (t: EventTarget | null): t is HTMLElement =>
  t !== null && 'focus' in t && 'nodeType' in t;

// ariaNotify() is newer than the DOM types; the live region is its fallback.
type Notifier = Document & { ariaNotify?: (message: string) => void };

function announce(region: HTMLElement, text: string) {
  const doc: Notifier = document;
  if (doc.ariaNotify) {
    doc.ariaNotify(text);
  } else {
    find('[data-toast-live]', region).textContent = text;
  }
}

function setUp(el: HTMLElement) {
  el.dataset.ready = '';
  el.addEventListener('focusin', (e) => {
    if (isElement(e.relatedTarget) && !el.contains(e.relatedTarget)) {
      returnFocusTo = e.relatedTarget;
    }
  });
  // Dismissed from its own button: put focus back where the customer was.
  el.addEventListener('toggle', (e) => {
    if ('newState' in e && e.newState === 'closed' && document.activeElement === document.body) {
      returnFocusTo?.focus();
    }
  });
}

function hide(el: HTMLElement) {
  if (el.contains(document.activeElement)) {
    el.addEventListener('focusout', () => hide(el), { once: true });
    return;
  }
  el.hidePopover();
}

export function toast(message: string): void {
  const el = document.getElementById('toast');
  const region = el?.parentElement;
  if (!el || !region) {
    return;
  }
  if (el.dataset.ready === undefined) {
    setUp(el);
  }
  find('[data-toast-text]', el).textContent = message;
  try {
    el.showPopover();
  } catch {
    /* Already showing: the new text replaces the old. */
  }
  announce(region, message);
  window.clearTimeout(timer);
  timer = window.setTimeout(() => hide(el), HIDE_AFTER_MS);
}
