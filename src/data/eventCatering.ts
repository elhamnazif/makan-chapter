import { money } from '../lib/format';

// Event catering flow from the client's "Customer journey: Event Catering" brief (v4, Nov 2026).
// DEMO DATA: menu names, package rules and fees come from the brief. The dish options and
// per-pax prices below are samples until Makan Chapter sends the final menu and prices.

export type PackageKey = 'mini' | 'classic';

export interface EventPackage {
  key: PackageKey;
  name: string;
  description: string;
  image: string;
  minPax: number;
  /** null: no upper limit (still to be confirmed for Classic). */
  maxPax: number | null;
  deliveryCents: number;
  deliveryLabel: string;
  includes: Array<string>;
}

export const eventPackages: Record<PackageKey, EventPackage> = {
  mini: {
    key: 'mini',
    name: 'Mini Catering',
    description:
      'Ready-to-enjoy food served in disposable trays, perfect for smaller gatherings. From 20 pax (max 50), cutlery provided. Drinks not included.',
    image: 'mini-buffet-tray',
    minPax: 20,
    maxPax: 50,
    deliveryCents: 3000,
    deliveryLabel: 'Delivery',
    includes: ['Disposable trays', 'Cutlery provided', '20 to 50 pax', 'Drinks not included'],
  },
  classic: {
    key: 'classic',
    name: 'Classic Catering',
    description:
      'The full buffet experience, served in warmers to keep your food hot throughout your event. From 50 pax, with cutlery and drinks included.',
    image: 'buffet-setup',
    minPax: 50,
    /** Larger orders are routed to WhatsApp for bulk terms, as on makanchapter.com. */
    maxPax: 100,
    deliveryCents: 8000,
    deliveryLabel: 'Delivery and collection',
    includes: [
      'Buffet setup with warmers',
      'Cutlery and drinks included',
      '50 to 100 pax online',
      'Our team sets up 1 hour before',
    ],
  },
};

export const fees = {
  cbdSentosaCents: 500,
  lateTeardownCents: 2000,
  /** Teardown strictly after this time (24h HH:MM) adds the late teardown fee. */
  lateTeardownAfter: '21:00',
  /** Calendar days. Whether this means business days is still to be confirmed. */
  leadDays: 3,
};

export interface MenuCategory {
  label: string;
  options: Array<string>;
  /** Optional sub-headings inside one category, e.g. fish and prawn options under Seafood. Still one pick. */
  sections?: Array<{ label: string; options: Array<string> }>;
  /** Shown only for this package, e.g. drinks come with Classic only. */
  only?: PackageKey;
}

export interface EventMenu {
  slug: string;
  name: string;
  /** null: no photo yet, a placeholder tile is shown. */
  image: string | null;
  blurb: string;
  priceCents: Record<PackageKey, number>;
  categories: Array<MenuCategory>;
}

function seafood(sections: Array<{ label: string; options: Array<string> }>): MenuCategory {
  return { label: 'Seafood', options: sections.flatMap((s) => s.options), sections };
}

const classicDrinks: MenuCategory = {
  label: 'Drinks',
  options: ['Teh Tarik Panas', 'Teh O Pandan', 'Honeydew Selasih', 'Bandung'],
  only: 'classic',
};

export const eventMenus: Array<EventMenu> = [
  {
    slug: 'nasi-ambeng',
    name: 'Nasi Ambeng',
    image: 'nasi-ambeng',
    blurb: 'A generous spread around fragrant rice, built for sharing.',
    priceCents: { mini: 1590, classic: 2390 },
    categories: [
      { label: 'Rice', options: ['Nasi Putih', 'Nasi Kuning', 'Nasi Minyak'] },
      {
        label: 'Chicken',
        options: [
          'Ayam Lemak Cili Api',
          'Ayam Masak Merah',
          'Ayam Goreng Berempah',
          'Ayam Masak Kicap',
        ],
      },
      {
        label: 'Beef',
        options: [
          'Daging Rendang',
          'Paru Goreng Berempah',
          'Daging Masak Hitam',
          'Daging Black Pepper',
        ],
      },
      { label: 'Vegetables', options: ['Urap', 'Sambal Goreng Tahu Tempe', 'Terong Belado'] },
      { label: 'Dessert', options: ['Kuih Lopes', 'Kaswi Pandan Gula Melaka', 'Putri Salat'] },
      classicDrinks,
    ],
  },
  {
    slug: 'nasi-lemak',
    name: 'Nasi Lemak',
    image: 'nasi-lemak-plate',
    blurb: 'Coconut rice with sambal and all the favourite sides.',
    priceCents: { mini: 1490, classic: 2290 },
    categories: [
      {
        label: 'Chicken',
        options: ['Ayam Goreng', 'Ayam Goreng Berempah', 'Ayam Masak Merah', 'Ayam Rendang'],
      },
      { label: 'Seafood', options: ['Sambal Sotong', 'Sambal Udang', 'Ikan Kuning Goreng'] },
      { label: 'Side', options: ['Telur Goreng', 'Telur Sambal', 'Bergedil'] },
      {
        label: 'Vegetables',
        options: ['Kangkung Belacan', 'Sayur Lodeh', 'Sambal Goreng Tahu Tempe'],
      },
      { label: 'Dessert', options: ['Kuih Lopes', 'Ondeh-Ondeh', 'Pudding cup'] },
      classicDrinks,
    ],
  },
  {
    slug: 'nasi-minyak',
    name: 'Nasi Minyak',
    image: 'ambeng-hamper',
    blurb: 'Festive ghee rice with rich curries, made for celebrations.',
    priceCents: { mini: 1490, classic: 2290 },
    categories: [
      {
        label: 'Chicken',
        options: ['Ayam Masak Merah', 'Ayam Korma', 'Ayam Rendang', 'Ayam Masak Kicap'],
      },
      { label: 'Meat', options: ['Daging Masala', 'Kambing Kurma', 'Daging Rendang'] },
      { label: 'Vegetables', options: ['Dhalcar', 'Sayur Lodeh', 'Pajeri Nenas'] },
      { label: 'Side', options: ['Acar', 'Papadom', 'Telur Rebus Masak Merah'] },
      { label: 'Dessert', options: ['Bubur Cha Cha', 'Kuih Seri Muka', 'Pudding cup'] },
      classicDrinks,
    ],
  },
  // Final menu from the client: "Western Delight Buffet", S$25.00 per pax (Nov 2026). One price was given for both packages.
  {
    slug: 'western-delights',
    name: 'Western Delights',
    image: null,
    blurb: 'One buffet menu with choices for adults and kids.',
    priceCents: { mini: 2500, classic: 2500 },
    categories: [
      { label: 'Rice', options: ['Nasi Goreng Kampung', 'Butter Rice', 'Lemon Rice'] },
      { label: 'Pasta', options: ['Seafood Aglio Olio', 'Creamy Pasta', 'Tom Yum Pasta'] },
      {
        label: 'Chicken',
        options: ['Fried Chicken with Honey Sauce', 'Lemon Chicken', 'Cereal Chicken'],
      },
      seafood([
        {
          label: 'Fish options',
          options: ['Sweet & Sour Fish', 'Black Pepper Fish', 'Creamy Lemon Fish'],
        },
        {
          label: 'Prawn options',
          options: ['Black Pepper Prawns', 'Cereal Prawns', 'Sambal Prawns'],
        },
      ]),
      { label: 'Dessert', options: ['Chocolate Brownies', 'Tiramisu', 'Blue Pea Pomelo Jelly'] },
      { label: 'Drinks', options: ['Teh Tarik', 'Cordial Drink'], only: 'classic' },
    ],
  },
  {
    slug: 'singapore-favourites',
    name: 'Singapore Favourites',
    image: null,
    blurb: 'Local favourites everyone knows and loves.',
    priceCents: { mini: 1490, classic: 2290 },
    categories: [
      {
        label: 'Rice or Noodles',
        options: ['Mee Goreng', 'Bee Hoon Goreng', 'Nasi Goreng Kampung', 'Mee Hoon Soto'],
      },
      {
        label: 'Main',
        options: ['Chicken Satay', 'Ayam Masak Merah', 'Chilli Prawns', 'Sweet and Sour Fish'],
      },
      { label: 'Vegetables', options: ['Sayur Chap Chai', 'Kangkung Belacan', 'Sayur Lodeh'] },
      { label: 'Side', options: ['Bergedil', 'Epok-Epok', 'Popiah'] },
      { label: 'Dessert', options: ['Bubur Cha Cha', 'Kuih Selection', 'Pudding cup'] },
      classicDrinks,
    ],
  },
];

export function categoriesFor(menu: EventMenu, pkg: PackageKey): Array<MenuCategory> {
  return menu.categories.filter((c) => !c.only || c.only === pkg);
}

export function fromPriceCents(menu: EventMenu): number {
  return Math.min(menu.priceCents.mini, menu.priceCents.classic);
}

export interface QuoteLine {
  label: string;
  cents: number;
  /** A surcharge on top of the package price and delivery. */
  extra?: boolean;
}

export interface Quote {
  lines: Array<QuoteLine>;
  totalCents: number;
}

export function menuBySlug(slug: string): EventMenu {
  const menu = eventMenus.find((m) => m.slug === slug);
  if (!menu) {
    throw new Error(`No catering menu ${slug}`);
  }
  return menu;
}

/** Every charge for an order, in display order, and the total. */
export function quote(
  menu: EventMenu,
  pkg: EventPackage,
  order: { pax: number; postal: string; teardownTime: string },
): Quote {
  const per = menu.priceCents[pkg.key];
  const lines: Array<QuoteLine> = [
    { label: `${order.pax} pax × ${money(per)}`, cents: per * order.pax },
    { label: pkg.deliveryLabel, cents: pkg.deliveryCents },
  ];
  if (isCbdOrSentosa(order.postal)) {
    lines.push({ label: 'CBD or Sentosa', cents: fees.cbdSentosaCents, extra: true });
  }
  if (pkg.key === 'classic' && order.teardownTime > fees.lateTeardownAfter) {
    lines.push({ label: 'Teardown after 9pm', cents: fees.lateTeardownCents, extra: true });
  }
  return { lines, totalCents: lines.reduce((sum, l) => sum + l.cents, 0) };
}

/** Assumed CBD (postal sectors 01 to 08) or Sentosa (098, 099). Still to be confirmed with the client. */
export function isCbdOrSentosa(postal: string): boolean {
  return /^0[1-8]\d{4}$/.test(postal) || /^09[89]\d{3}$/.test(postal);
}
