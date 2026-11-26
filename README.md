# Makan Chapter website

Catering site for Makan Chapter, built with Astro and Tailwind CSS. Preview: https://makanchapter.elham.dev/

The layout and customer flow are modelled on makanmate.com and use Makan Chapter's real menus, prices, photos and terms.

## Run

```bash
npm install
npm run dev                    # http://127.0.0.1:4321
npm run build                  # static site in dist/
```

## Where things live

- `src/styles/theme.css`: every colour, font and radius, for the light and dark themes. A visual retheme should only touch this file.
- `src/components/ThemeToggle.astro`: the light/dark switch. Light is the default. A visitor's choice is stored in `localStorage` (`mc-theme`) and applied in `<head>` before first paint (`src/layouts/Layout.astro`). The OS setting is ignored. Tailwind's `dark:` variant follows this choice.
- `src/data/packages.ts`: mini buffet sets and buffet catering packages, taken word for word from makanchapter.com. The array order is the listing order, and the group order is the menu order on each package page.
- `src/data/catalogue.json`: the 41 online-ordering items and categories.
- `src/data/site.ts`: contact details, menu PDFs, navigation, reviews.
- `src/scripts/cart.ts`: the browser-only cart.

## Flow

Home → catering category → package → add-ons → cart → delivery details. The last step opens WhatsApp with the full order written out. There is no payment, account or order backend, and nothing is sent unless the customer presses send in WhatsApp. Buffet catering packages end in a WhatsApp quotation request instead of the cart.

## Tests

```bash
python -m venv .venv && .venv/bin/pip install -r tests/requirements.txt
npm run build
.venv/bin/python tests/test_content.py                          # static checks on dist/
npx astro preview --port 18763 &                                 # serves dist/
.venv/bin/python tests/browser_acceptance.py                    # URL=https://makanchapter.elham.dev/ to test live
```

The browser test drives Chromium (`CHROMIUM` env var, default `/usr/bin/chromium`) through every page at phone and desktop widths in both themes, plus the theme switch, buffet listing, quotation, Order Online and cart, and mini buffet flows. It intercepts `window.open`, so no WhatsApp message is ever sent. Screenshots go to `test-results/`.

## Deploying

Caddy on Meridian serves `/var/www/makanchapter/`. Run `npm run build` and replace that directory's contents with `dist/`.
