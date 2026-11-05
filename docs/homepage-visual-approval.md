# Task 11B — homepage visual review

Reviewed on 2026-11-05, Europe/Stockholm. Implementation and visual review complete; final merchant visual approval is still required once the original logo and approved campaign photography are configured. No pixel-perfect claim is made.

## Reference and scope

Inspected `design/reference/salamshop-approved-design.png`, `approved-visual-design.md` and `approved-visual-validation.md` before coding. The reference is a composite: its left-hand homepage is the composition guide. Its mobile panel is a product page, so the homepage's mobile arrangement is a responsive interpretation rather than a copy of a supplied mobile homepage.

Inspected the homepage JSON template, all seven homepage sections, header, shared cards/grid, design tokens, schema/settings, both languages and related CSS. Retained Shopify Liquid, JSON sections, forms, menus, cart/search behavior and all existing setting IDs. Existing uncommitted Task 11A work was preserved.

## Implementation

- Header: aligned its edges with homepage content, retained the unchanged logo image picker, centered the separate desktop navigation row, and changed the search submit presentation to a named search icon at the start of the beige pill. Search clear/submit, predictive results, mobile search, account and cart contracts are retained. The shop-name fallback wraps within the available space while the original logo is unconfigured.
- Hero: editorial geometry defaults to approximately 2.07:1 on desktop, 28px container corners through the existing token, left-aligned Swedish copy and pill CTA. Both image pickers and focal points work; mobile-only images can also supply the desktop fallback. A new localized Editorial/Custom height selector preserves the existing height sliders in Custom mode. The unconfigured state is a quiet beige canvas with dark text, not a simulated lifestyle photograph. Merchant overlay/text color controls remain available for actual imagery.
- Categories: seven rounded-square images with short labels underneath, linked to verified development-store collections. Desktop uses a single seven-column row; tablet uses four columns and mobile three compact columns. Blocks remain replaceable/reorderable, with collection/image/label controls. Empty optional headings no longer reserve space.
- Products: flat shared cards, large rounded 6:5 media, dark prices and genuine sale/sold-out badges. Square and portrait options remain available. Fixed missing product photography by falling back from `featured_media.preview_image` to Shopify's `featured_image`. All eight homepage product cards rendered real catalog images in the final browser review. No reviews, wishlist UI, swatch guesses or product data were invented.
- Supporting content: bounded rounded editorial/newsletter panels and tighter section rhythm. The brand-values section can serve as a tonal service strip using merchant-authored messages and line icons; blank items and entirely unconfigured strips are hidden. Delivery, shield, return and headset icons were added without default promises. The starter service strip remains disabled.
- Responsive controls: retained safe-area-aware bottom navigation and existing tablet rail. Kept floating cart above mobile navigation and corrected its desktop bottom offset when bottom navigation is hidden. The existing product-page rule continues to hide the floating cart beside the sticky purchase control; no product/cart functionality was rebuilt.

All seven sections retain presets, so they remain addable, removable and reorderable. Swedish/English schema translations cover the nine added labels/options. No new JavaScript or frontend dependency was introduced. Homepage CSS was rewritten in place, removing the prior category mosaic and duplicated panel treatments rather than adding a second override sheet.

## Real catalog configuration

Read the local preview's catalog using its read-only `browse_store` tool. It returned eight collections, including these seven exact category matches:

| Category | Verified collection handle |
| --- | --- |
| Bönemattor | `bonemattor` |
| Damkläder | `damklader` |
| Herrkläder | `herrklader` |
| Dofter och rökelse | `dofter-och-rokelse` |
| Koranen och bönetillbehör | `koranen-och-bonetillbehor` |
| Hem och dekoration | `hem-och-dekoration` |
| Personlig vård | `personlig-vard` |

References live only in the editable homepage JSON configuration; Liquid category rendering does not hardcode store handles. Both product rows use the actual `all` collection as a starter source, with four products each. The clothing collection returned only one product, so it was not used to populate an artificially repeated four-card row. The new-arrivals row sorts the products Shopify supplies by publication date; without pagination this is limited to Shopify's returned collection subset, not a guarantee of the newest products across an arbitrarily large catalog. For final merchandising, select dedicated curated featured/new-arrivals collections with the intended ordering and product mix. No collection membership or product record was changed.

## Five largest implementation mismatches and corrections

| Initial mismatch versus reference | Correction and observed result |
| --- | --- |
| Tall viewport-driven hero and oversized copy | Added editorial ratio, retained custom height mode, reduced copy scale/weight. At 1440px the rendered hero measured 1200 × 579.7px, a 2.07:1 ratio. |
| Large asymmetric category mosaic with overlay labels | Replaced it with seven equal square tiles and labels below. Verified all seven actual collection URLs in the rendered DOM. |
| Repeated inset beige containers reduced product space | Removed nested product/category panels and duplicate gutters. Hero, category and product edges now align; featured grid has four 291px columns at desktop. |
| Product images became placeholders despite available Shopify image data | Added the shared `featured_image` fallback. Final homepage contained eight product images and zero product SVG placeholders. |
| Heavy search submit treatment and uneven header/navigation spacing | Used the existing search icon in a quiet pill, centered desktop links, aligned header content, and corrected the tablet fallback word wrapping found during iteration. |

The remaining highest-impact differences are merchant assets/content, documented below. Their absence was not hidden with stock imagery, extracted mockup pixels, a replacement logo or fabricated commerce claims.

## Actual local screenshots

The initial port 9393 probe failed. The user supplied **http://127.0.0.1:9292/**, which successfully rendered SalamShop Development. All Task 11B screenshots are from this local Shopify preview using real store data, not HTML fixtures or the earlier remote theme.

Files are in `design/baseline/task-11b/`:

| Capture | Requested viewport | Saved JPEG pixels |
| --- | --- | --- |
| `before-desktop.jpg` | 1440 × 1000 | 1037 × 720 |
| `before-mobile.jpg` | 390 × 844 | 375 × 260 |
| `after-desktop.jpg` | 1440 × 1000 | 1425 × 990 |
| `after-tablet.jpg` | 768 × 1024 | 753 × 1004 |
| `after-mobile.jpg` | 390 × 844 | 375 × 812 |
| `after-desktop-products.jpg` | 1440 × 1000 | 1425 × 990 |
| `after-mobile-products.jpg` | 390 × 844 | 375 × 812 |
| `search-desktop.jpg` | 1440 × 1000 | 1425 × 990 |

The browser export sizes differ from the requested viewport settings. In particular, the two initial baseline files are smaller/partial captures and are not valid full-frame pixel-diff inputs. They were saved before implementation; they have not been rebuilt or resized to suggest matching frames. The final views were visually inspected at each requested breakpoint before saving. These are viewport captures to avoid the fixed/sticky-element stitching problems found in Task 11A. Supporting product screenshots show a scrolled viewport with the real sticky header/bottom navigation. The viewport override was reset after review.

## Browser verification and limitations

Recorded metrics in `browser-metrics.json`:

| Requested width | Document client / scroll width | Product grid |
| --- | --- | --- |
| 320 | 305 / 305 | 2 columns |
| 390 | 375 / 375 | 2 columns |
| 768 | 753 / 753 | 4 columns |
| 1440 | 1425 / 1425 | 4 columns |

No horizontal document overflow was observed. The 15px difference between requested width and document client width is the scrollbar. There were seven category links and eight product images at every measured width. On mobile the hero was 448px high, with content allowed to grow. At tablet its minimum height accommodates copy rather than forcing the desktop aspect ratio at the expense of text.

Browser interaction checks:

- Predictive search for `hijab` returned eight genuine results, including Sedef Hijab, with actual prices and links. Escape closed suggestions; clearing the query retained the native search form.
- The header cart action opened the existing empty-cart dialog with localized content. No items were added or removed, and checkout was not submitted.
- Mobile menu opened, exposed real menu links, closed with Escape, and returned focus to its trigger.
- Real sale/sold-out states appeared on product cards. Prices use Shopify formatting, including variable prices and compare prices where supported.

Final captured warning/error log: **empty**, saved as `browser-errors.json`. During development, live reload reset the cart dialog before a close-button click, causing a browser-automation locator timeout; refreshing the DOM confirmed the dialog had already closed. This was an automation/live-reload race, not an observed storefront JavaScript error. Shopify's cookie banner reappeared after full live reloads and was dismissed through its normal Decline control for final screenshots. The initial baselines may include the banner.

The cart was empty, so a populated floating-cart interaction was not exercised. Its spacing was checked in CSS; the existing regression validators cover cart contracts. A device with a physical safe-area inset, long custom menus, 200% zoom, assistive technology, newsletter submission, every Theme Editor operation and LCP/CLS lab scores were not separately tested in this task. Existing responsive image generation, image dimensions, lazy loading and hero high-priority loading remain in place; no performance-score improvement is claimed. Final campaign images need a fresh contrast/LCP/crop check once selected.

## Automated validation

All ten existing validators passed with exit code 0: cart, collection, design system, header, homepage, launch readiness, locales, Material 3, product and search. The homepage validator additionally covers editorial height mode, focal-point use, legible empty hero state and omission of blank service claims.

`shopify theme check --output json`: **valid; 0 errors, 0 warnings, 0 informational issues**.

`git diff --check`: passed.

Logs: `design/baseline/task-11b/validators.txt` and `theme-check.json`. Schema locale parity: 288 keys per language. Task 11A default contrast still passes, including 4.71:1 primary actions and 14.60:1 text on the ivory canvas. Arbitrary merchant color/image changes still require review.

## Merchant assets and remaining visual differences

1. **Original gold logo:** not configured in the preview. Select the original unchanged file through the logo picker; the current shop-name text fallback is not the final visual identity. No logo was redrawn or substituted.
2. **Hero and editorial photography:** supply approved desktop/mobile lifestyle images, suitable negative space for the headline, focal points, and the supporting editorial image. No stock photograph was added. The large beige regions in the screenshots are explicit empty-image states.
3. **Category artwork:** Dofter och rökelse and Personlig vård currently fall back to Shopify placeholders. Select merchant-provided image overrides. The real seven categories differ from the mockup's Hijab/Mössor/Thobe navigation taxonomy; they were not renamed or linked to invented collections.
4. **Product selection and photography:** the supplied catalog's merchandise, prices and image crops differ from the reference. Curate the featured and arrival collections and choose square/portrait/6:5 framing. Existing contain fit preserves full product detail; inconsistent source-image backgrounds remain visible.
5. **Navigation content:** the existing merchant menu still reads Home/Catalog/Contact and has three bottom-navigation entries. Configure the intended Swedish menu. No unsupported favorites destination, wishlist button or fake reviews were added.
6. **Service messages:** enable the optional strip only after entering verified messages and selecting icons. Delivery periods, refund periods, certifications and guarantees were intentionally not prefilled. Blank blocks remain hidden.
7. **Supporting sections:** editorial/newsletter content remains present and editable, extending beyond the small homepage excerpt in the reference. The original mockup's outer device frame, status bar and presentation shadows are not storefront UI.

No production changes, explicit deployment/push/publication command, product-data write or Git commit was performed. The user-started development preview reflected local file edits through its existing live-reload session. Saved global settings were not overwritten. Stopped after Task 11B; Task 11C was not started.
