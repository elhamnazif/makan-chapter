"""Static checks on the built site. Run after `npm run build` (any BASE)."""
import os
import unittest
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / os.environ.get('DIST', 'dist')
PAGES = sorted(DIST.rglob('*.html'))


def doc(path):
    return BeautifulSoup((DIST / path).read_text(), 'html.parser')


class Content(unittest.TestCase):
    def test_built(self):
        self.assertTrue(PAGES, f'no pages in {DIST}; run npm run build first')

    def test_services(self):
        section = doc('index.html').select_one('[aria-labelledby="services-title"]')
        titles = [a.select_one('span.text-lg').get_text(strip=True) for a in section.select('li > a')]
        self.assertEqual(titles, ['Mains and Bakar-Bakar', 'Buffet Catering', 'Mini Buffet', 'Kuih Muih'])

    def test_no_gift_card_or_loyalty(self):
        for f in PAGES:
            s = BeautifulSoup(f.read_text(), 'html.parser')
            self.assertFalse(s.select('a[href*="/gift-card/"],a[href*="/loyalty/"]'), f)
            text = s.get_text(' ', strip=True).lower()
            self.assertNotIn('gift card', text, f)
            self.assertNotIn('loyalty', text, f)
        self.assertFalse((DIST / 'gift-card').exists())
        self.assertFalse((DIST / 'loyalty').exists())

    def test_catering_filters_and_priority(self):
        s = doc('catering/buffet/index.html')
        self.assertFalse(s.select('[data-filter="budget"],[data-filter="pax"]'))
        names = [x.select_one('h3').get_text(strip=True) for x in s.select('[data-package][data-category="buffet"]')]
        self.assertEqual(names, ['Indonesian Nasi Ambeng', 'Kampong Cuisine', 'Indian Cuisine'])
        self.assertEqual(len(s.select('[data-package]')), 8)
        mini = doc('catering/mini-buffet/index.html')
        self.assertTrue(mini.select('[data-filter="budget"]') and mini.select('[data-filter="pax"]'))

    def test_package_group_order(self):
        for slug in ['indian-cuisine', 'kampong-cuisine']:
            s = doc(f'package/{slug}/index.html')
            self.assertEqual([x['data-label'] for x in s.select('[data-group]')], ['Main', 'Desserts', 'Beverages', 'Appetizer'])

    def test_theme_everywhere(self):
        for f in PAGES:
            s = BeautifulSoup(f.read_text(), 'html.parser')
            self.assertEqual(s.html.get('data-theme'), 'light', f)
            self.assertEqual(len(s.select('[data-theme-toggle]')), 1, f)
            first = s.head.find('script')
            self.assertTrue(first and 'mc-theme' in (first.string or ''), f'{f}: theme must be applied in head')
            self.assertTrue(s.select_one('meta[name="color-scheme"]'), f)
            self.assertFalse(s.select('source[media*="prefers-color-scheme"]'), f)


if __name__ == '__main__':
    unittest.main()
