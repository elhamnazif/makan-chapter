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
npm test                                  # builds, serves and runs every test
URL=https://makanchapter.elham.dev/ npm test   # the same tests against the live site
```

Playwright runs the browser tests in `tests/` with the system Chromium (`/usr/bin/chromium`, or set `CHROMIUM`). Without one, run `npx playwright install chromium` first. The ordering flows run at desktop and phone widths. Every page linked from the home page is also checked at 320, 390, 768 and 1440px for broken links, sideways scrolling and broken images. `window.open` is replaced in every test, so no WhatsApp message is ever sent. A failed test keeps a trace in `test-results/`. Open it with `npx playwright show-trace`.

Also run `npm run lint`, `npm run format:check` and `npm run check`.

## Deploying

Caddy on Meridian serves `/var/www/makanchapter/`. Run `npm run build` and replace that directory's contents with `dist/`.
