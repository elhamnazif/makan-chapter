// Business facts below come from makanchapter.com extracts (Sept 2026).
// Do not add claims (hours, certifications, awards) that the owners have not approved.
export const business = {
  name: 'Makan Chapter',
  tagline: 'We Know, Makan Matters',
  phoneDisplay: '+65 9686 5290',
  phoneHref: 'tel:+6596865290',
  whatsapp: '6596865290',
  email: 'sales@makanchapter.com',
  address: ['1076 Serangoon Rd', 'Singapore 328180'],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=1076+Serangoon+Rd+Singapore+328180',
  instagram: 'https://www.instagram.com/makanchapter/',
  facebook: 'https://www.facebook.com/MakanChapterPteLtd/',
};

export const menuPdfs = [
  {
    label: 'Bakar-Bakar menu',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_8c79f4b71a2c4cfbae9b0fb10d35aedf.pdf',
  },
  {
    label: 'Nasi Ambeng menu',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_ef419c866c7d47c1a717f5f01849147e.pdf',
  },
  {
    label: 'Nasi menu',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_df947655229949a78d3e6baaf78c77b3.pdf',
  },
  {
    label: 'Kuih Kuih menu',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_f82a1416565a4f16bb79202c24212171.pdf',
  },
  {
    label: 'Kuih muih minimum order list',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_121e681d7eaa4474a5da0aef6ceb9dde.pdf',
  },
  {
    label: 'Kuih muih and cakes price list',
    href: 'https://www.makanchapter.com/_files/ugd/8a18f2_dd268273de20453586d07543602b013d.pdf',
  },
];

/** Prefix a site-relative path with the configured base. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

export function waLink(text: string): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function money(cents: number): string {
  const v = cents / 100;
  return `S$${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}`;
}

export interface NavItem {
  label: string;
  href: string;
  match?: Array<string>;
  children?: Array<{ label: string; href: string }>;
}

export const nav: Array<NavItem> = [
  { label: 'Home', href: '' },
  { label: 'Our Story', href: 'our-story/' },
  // No dropdown: Catering opens the Catering page directly (client brief v4, Nov 2026).
  { label: 'Catering', href: 'catering/', match: ['catering/', 'package/'] },
  { label: 'Order Online', href: 'order/' },
  { label: 'Contact', href: 'contact/' },
];

export const reviews = [
  'Alhamdulillah, excellent feedback from my colleagues and bosses. “Very very very nice, satisfied, yummy hot chilli.”',
  'Alhamdulilah makan semua sedap. Portion super a lot. Banyak guest tanya nama caterer.',
  'Thanks boss, tu hari org semua kasi 10/10 sedap and the rice in the bakul so nice.',
];
