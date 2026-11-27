// Patterns for the pattern attribute. The browser matches the whole value, with the v flag.

/** A Singapore number, mobile or landline, with optional +65 and spaces or dashes: 9123 4567. */
export const phonePattern = String.raw`(\+?65[\s\-]*)?[3689]([\s\-]*\d){7}`;

/** Stricter than type="email" alone, which accepts addresses without a dot in the domain. */
export const emailPattern = String.raw`[^\s@]+@[^\s@]+\.[^\s@]+`;

export const postalPattern = String.raw`\d{6}`;
