// Package facts are verbatim from makanchapter.com/mini-buffet and the catering pages.
export type CategorySlug = 'mini-buffet' | 'buffet';

export interface DishGroup {
  label: string;
  items: Array<string>;
  /** When set, the customer picks exactly this many items from the group. */
  choose?: number;
}

export interface Package {
  slug: string;
  name: string;
  category: CategorySlug;
  image: string;
  blurb: string;
  /** 'order' adds to cart, 'quote' prepares a WhatsApp quotation. */
  mode: 'order' | 'quote';
  perPaxCents: number | null;
  setPriceCents?: number;
  paxPerSet?: number;
  minPax: number;
  /** Lower per-pax price from a guest count, e.g. S$30 from 300 guests. */
  promo?: { fromPax: number; perPaxCents: number };
  groups: Array<DishGroup>;
  includes?: Array<string>;
  notice?: string;
  terms: Array<string>;
}

export const categories: Record<CategorySlug, { title: string; intro: string; image: string }> = {
  'mini-buffet': {
    title: 'Mini Buffet',
    intro: 'Complete 20-pax sets in disposable trays, delivered islandwide.',
    image: 'mini-buffet-tray',
  },
  buffet: {
    title: 'Buffet Catering',
    intro: 'Full buffet with setup, warmers and collection for larger events.',
    image: 'buffet-setup',
  },
};

const miniTerms = [
  'Food served in disposable trays. Warmer and buffet set-up not included (additional charges apply if required).',
  'Menu items are not exchangeable.',
  'Minimum order 20 pax.',
  'Delivery charges S$30, islandwide.',
];

const mini = (
  p: Omit<Package, 'category' | 'mode' | 'minPax' | 'paxPerSet' | 'terms'>,
): Package => ({
  ...p,
  category: 'mini-buffet',
  mode: 'order',
  minPax: 20,
  paxPerSet: 20,
  terms: miniTerms,
});

const buffetIncludes = [
  'Warmer, burner and buffet setup',
  'Disposable plates, cups and cutlery',
  'Water dispenser',
  'Delivery and collection of items',
];

export const packages: Array<Package> = [
  mini({
    slug: 'nasi-ambeng-set',
    name: 'Nasi Ambeng Set',
    image: 'nasi-ambeng',
    blurb: 'Eleven dishes around nasi putih, built for sharing.',
    perPaxCents: 1590,
    setPriceCents: 31_800,
    groups: [
      {
        label: 'Included dishes',
        items: [
          'Nasi Putih',
          'Ayam Lemak Cili Api',
          'Sambal Goreng Tahu Tempe',
          'Sambal Sotong',
          'Daging Rendang',
          'Urap',
          'Acar',
          'Sambal Belachan',
          'Bergedil',
          'Terong Belado',
          'Paru Goreng Berempah',
        ],
      },
    ],
  }),
  mini({
    slug: 'nasi-lemak-set',
    name: 'Nasi Lemak Set',
    image: 'nasi-lemak-plate',
    blurb: 'Nasi lemak with ayam goreng, rendang and sambal sotong.',
    perPaxCents: 1490,
    setPriceCents: 29_800,
    groups: [
      {
        label: 'Included dishes',
        items: [
          'Nasi Lemak',
          'Ayam Goreng',
          'Sambal Sotong',
          'Daging Rendang',
          'Kacang & Ikan Bilis Goreng',
          'Telur Goreng',
          'Timun',
        ],
      },
    ],
  }),
  mini({
    slug: 'nasi-sambal-goreng-set',
    name: 'Nasi Sambal Goreng Set',
    image: 'nasi-plate',
    blurb: 'Ayam goreng and paru with sambal goreng and bergedil.',
    perPaxCents: 1390,
    setPriceCents: 27_800,
    groups: [
      {
        label: 'Included dishes',
        items: [
          'Nasi Putih',
          'Ayam Goreng',
          'Paru Goreng Berempah',
          'Sambal Goreng Tahu Tempeh',
          'Sambal Tumis',
          'Bergedil',
        ],
      },
    ],
  }),
  mini({
    slug: 'nasi-classic-set',
    name: 'Nasi Classic Set',
    image: 'lauk',
    blurb: 'Ayam masak merah and black pepper beef with your choice of rice.',
    perPaxCents: null,
    setPriceCents: 29_800,
    groups: [
      { label: 'Rice', items: ['Nasi Jagung', 'Nasi Tomato'], choose: 1 },
      {
        label: 'Included dishes',
        items: ['Ayam Masak Merah', 'Daging Black Pepper', 'Sayur Chap Chai'],
      },
    ],
  }),
  mini({
    slug: 'nasi-minyak-set',
    name: 'Nasi Minyak Set',
    image: 'ambeng-hamper',
    blurb: 'Nasi minyak with ayam masak merah, daging masala and dhalcar.',
    perPaxCents: 1490,
    setPriceCents: 29_800,
    groups: [
      {
        label: 'Included dishes',
        items: ['Nasi Minyak', 'Ayam Masak Merah', 'Daging Masala', 'Dhalcar', 'Acar'],
      },
    ],
  }),
  {
    slug: 'indonesian-nasi-ambeng',
    name: 'Indonesian Nasi Ambeng',
    category: 'buffet',
    mode: 'quote',
    image: 'kuih-tower',
    blurb: 'Hot and spicy Indonesian spread, with our Beef Rendang as the highlight.',
    perPaxCents: 3200,
    minPax: 150,
    promo: { fromPax: 300, perPaxCents: 3000 },
    groups: [
      {
        label: 'Main course',
        items: [
          'Steamed white rice, Nasi Minyak or Nasi Kuning',
          'Beef Rendang',
          'Ayam Masak Merah or Ayam Lemak Cili Api',
          'Sambal Udang',
          'Sambal Goreng (tempeh, tofu, long beans)',
          'Bergedil Kentang',
          'Urap Sayur',
          'Acar',
          'Paru Belado',
          'Sambal Belachan',
          'Mee hoon and mee soto corner, or fried bee hoon',
        ],
      },
      {
        label: 'The Traditionals',
        items: [
          'Klepon (onde-onde)',
          'Kuih Jongkong shooter',
          'Putri Salat',
          'Kaswi Pandan Gula Melaka',
          'Lopes',
          'Kaswi Original',
          'Apam Gula Hangus',
        ],
        choose: 4,
      },
      {
        label: 'The Savoury',
        items: ['Epok-epok Kentang', 'Bakwan (vegetable fritters)', 'Sate Madura chicken shooter'],
        choose: 1,
      },
      {
        label: 'Cakes, pastries and pudding',
        items: [
          'Caramel cheese brownies',
          'Fruit tarts',
          'Cream puffs',
          'Mango pudding shooter',
          'Chocolate pudding shooter',
          'Tray cake',
        ],
        choose: 3,
      },
      {
        label: 'Free-flow drinks',
        items: ['Teh Tarik Panas', 'Teh O Pandan', 'Honeydew Selasih', 'Ice water'],
      },
    ],
    includes: [
      'Buffet service setup',
      'Dessert and drinks corner styled with wedding theme',
      'Staff included for 4 hours',
      'Melamine plates and cutlery (glassware add-on at S$3 per pax)',
    ],
    notice: 'Enquire early so we can plan staffing and setup for your date.',
    terms: [
      'Package price applies from 150 guests.',
      'Promotional pricing of S$30 per pax applies from 300 guests.',
    ],
  },
  {
    slug: 'kampong-cuisine',
    name: 'Kampong Cuisine',
    category: 'buffet',
    mode: 'quote',
    image: 'buffet-line',
    blurb: 'Authentic Malay-style food for gatherings from 30 pax.',
    perPaxCents: null,
    minPax: 30,
    groups: [
      {
        label: 'Main',
        items: [
          'Nasi Putih',
          'Ayam Lemak',
          'Sambal Udang',
          'Paru Goreng Berempah',
          'Sambal Goreng Tahu Tempe',
        ],
      },
      { label: 'Desserts', items: ['3 types of petite cake', '2 traditional kueh'] },
      { label: 'Beverages', items: ['Tea', 'Coffee', 'Coke / 7Up'] },
      { label: 'Appetizer', items: ['Tahu Goreng'] },
    ],
    includes: buffetIncludes,
    notice: 'Order must be placed 3 working days in advance.',
    terms: [
      'For orders above 100 pax, contact us for bulk terms.',
      'Additional surcharge for areas without lift landing.',
      'Additional charges apply for add-on accessories such as buffet trays.',
    ],
  },
  {
    slug: 'indian-cuisine',
    name: 'Indian Cuisine',
    category: 'buffet',
    mode: 'quote',
    image: 'briyani-buffet',
    blurb: 'All-time favourite food, ideal for every occasion.',
    perPaxCents: 2690,
    minPax: 150,
    groups: [
      {
        label: 'Main',
        items: ['Nasi Briyani Dam', 'Chicken Leg', 'Acar', 'Sambal Udang', 'Dalcha'],
      },
      { label: 'Desserts', items: ['3 types of petite cake', '2 traditional kueh'] },
      { label: 'Beverages', items: ['Tea', 'Coffee', 'Coke / 7Up'] },
      { label: 'Appetizer', items: ['Samosa and Popiah'] },
    ],
    includes: buffetIncludes,
    notice: 'Order must be placed one month in advance.',
    terms: [
      'Additional surcharge for areas without lift landing.',
      'Additional charges apply for add-on accessories such as buffet trays.',
    ],
  },
];

export const occasions = [
  {
    title: 'Corporate Event',
    image: 'buffet-line',
    message: 'Hi Makan Chapter, I would like a quotation for a corporate event.',
  },
  {
    title: 'Wedding',
    image: 'kuih-tower',
    message: 'Hi Makan Chapter, I would like a quotation for a wedding.',
  },
  {
    title: 'Birthday Party',
    image: 'ambeng-basket',
    message: 'Hi Makan Chapter, I would like a quotation for a birthday party.',
  },
  {
    title: 'Festive Gathering',
    image: 'dessert-table',
    message: 'Hi Makan Chapter, I would like a quotation for a festive gathering.',
  },
];

export function priceLabel(p: Package): string {
  if (p.perPaxCents !== null) {
    return `S$${(p.perPaxCents / 100).toFixed(2)}/pax`;
  }
  if (p.setPriceCents !== undefined) {
    return `S$${p.setPriceCents / 100}/set`;
  }
  return 'Price on request';
}

export function minLabel(p: Package): string {
  return p.paxPerSet ? `${p.paxPerSet} pax per set` : `Min. ${p.minPax} pax`;
}
