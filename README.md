# Makan Chapter website (layout phase)

Layout and customer flow modelled on makanmate.com, filled with Makan Chapter's real menus, prices, photos and terms. The visual theme is a neutral placeholder until the client picks one.

## Run

```bash
npm install
npm run dev            # http://127.0.0.1:4321
npm run build          # static site in dist/
BASE=/layout/ npm run build   # when hosting under a subfolder
```

## Where things live

- `src/styles/theme.css`: every colour, font and radius. Swapping the theme should only touch this file.
- `src/data/packages.ts`: mini buffet sets and buffet catering packages, verbatim from makanchapter.com.
- `src/data/catalogue.json`: the 41 online-ordering items and categories.
- `src/data/site.ts`: contact details, menu PDFs, navigation, reviews.
- `src/scripts/cart.ts`: the browser-only cart.

## Flow

Home, catering category, package, add-ons, cart, delivery details. The last step opens WhatsApp with the full order written out. There is no payment, account or order backend: nothing is sent unless the customer presses send in WhatsApp. Buffet catering packages end in a WhatsApp quotation request instead of the cart.

`reference/` holds the source extracts and photos pulled from the September prototypes and is not part of the site.
