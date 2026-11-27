// Buffets for weddings and large events, verbatim from makanchapter.com. These are not
// ordered online: each has a menu page that ends in a WhatsApp quotation request.
import { money } from '../lib/format';

export interface DishGroup {
  label: string;
  items: Array<string>;
  /** The customer picks this many items from the group when the quotation is agreed. */
  choose?: number;
}

export interface Buffet {
  slug: string;
  name: string;
  image: string;
  blurb: string;
  /** null: price on request. */
  perPaxCents: number | null;
  minPax: number;
  /** Lower per-pax price from a guest count, e.g. S$30 from 300 guests. */
  promo?: { fromPax: number; perPaxCents: number };
  groups: Array<DishGroup>;
  includes: Array<string>;
  notice: string;
  terms: Array<string>;
}

const included = [
  'Warmer, burner and buffet setup',
  'Disposable plates, cups and cutlery',
  'Water dispenser',
  'Delivery and collection of items',
];

export const buffets: Array<Buffet> = [
  {
    slug: 'indonesian-nasi-ambeng',
    name: 'Indonesian Nasi Ambeng',
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
    includes: included,
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
    includes: included,
    notice: 'Order must be placed one month in advance.',
    terms: [
      'Additional surcharge for areas without lift landing.',
      'Additional charges apply for add-on accessories such as buffet trays.',
    ],
  },
];

/** WhatsApp quotation requests by occasion, for events that do not fit a listed buffet. */
export const occasions = [
  {
    title: 'Corporate event',
    message: 'Hi Makan Chapter, I would like a quotation for a corporate event.',
  },
  { title: 'Wedding', message: 'Hi Makan Chapter, I would like a quotation for a wedding.' },
  {
    title: 'Birthday party',
    message: 'Hi Makan Chapter, I would like a quotation for a birthday party.',
  },
  {
    title: 'Festive gathering',
    message: 'Hi Makan Chapter, I would like a quotation for a festive gathering.',
  },
];

export function priceLabel(b: Buffet): string {
  return b.perPaxCents === null ? 'Price on request' : `${money(b.perPaxCents)}/pax`;
}

export function quoteMessage(b: Buffet): string {
  return `Hi Makan Chapter, I would like a quotation for the ${b.name} buffet.`;
}
