// Form checks on the browser's own constraints (required, type, pattern, min, max, step),
// with the messages written in the markup:
//   data-missing  required and empty (only spaces counts as empty)
//   data-under    below min        data-over  above max
//   data-invalid  any other failed constraint
// A control's message goes in #<id>-error, which the control lists in aria-describedby.
// Forms keep novalidate, so the browser's own bubbles never show.
import { byId } from './dom';

export type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
/** Extra checks by control id, run when the built-in constraints pass. '' means valid. */
export type Rules = Record<string, (el: Control) => string>;

const controlTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const isControl = (t: EventTarget | null): t is Control =>
  t !== null && 'tagName' in t && controlTags.has(String(t.tagName));

const isFlagged = (t: EventTarget | null): t is Control =>
  isControl(t) && Boolean(t.id) && t.getAttribute('aria-invalid') === 'true';

function messageFor(el: Control): string {
  const v = el.validity;
  const d = el.dataset;
  if (v.valueMissing || (el.required && !el.value.trim())) {
    return d.missing ?? el.validationMessage;
  }
  if (v.rangeUnderflow && d.under) {
    return d.under;
  }
  if (v.rangeOverflow && d.over) {
    return d.over;
  }
  return v.valid ? '' : (d.invalid ?? el.validationMessage);
}

/** Shows or clears a control's message. True when it is valid. */
export function showMessage(el: Control, message: string): boolean {
  const err = byId(`${el.id}-error`);
  err.textContent = message;
  err.hidden = !message;
  if (message) {
    el.setAttribute('aria-invalid', 'true');
  } else {
    el.removeAttribute('aria-invalid');
  }
  return !message;
}

/**
 * Wires a form. Messages appear on submit. A flagged control clears as soon as the customer
 * fixes it, and is checked again when they leave it, never on each keystroke.
 * Returns a check for a set of controls that shows every message and gives the first
 * invalid control, for focus, or null.
 */
export function validator(form: HTMLFormElement, rules: Rules = {}) {
  const message = (el: Control) => messageFor(el) || (rules[el.id]?.(el) ?? '');
  const check = (el: Control) => showMessage(el, message(el));
  form.addEventListener('input', (e) => {
    if (isFlagged(e.target) && !message(e.target)) {
      showMessage(e.target, '');
    }
  });
  form.addEventListener('focusout', (e) => {
    if (isFlagged(e.target)) {
      check(e.target);
    }
  });
  return (controls: Iterable<Control>): Control | null => {
    let first: Control | null = null;
    for (const el of controls) {
      if (!check(el)) {
        first ??= el;
      }
    }
    return first;
  };
}
