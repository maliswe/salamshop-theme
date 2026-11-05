# SalamShop 2.0 Material Design 3 redesign

> Historical implementation record. The image is now available and was inspected for Task 11A. Follow [the approved visual specification](approved-visual-design.md) for current visual rules; retain the working commerce/navigation behavior described here.

## Outcome

The storefront presentation now uses a warm, restrained Material Design 3 system while retaining the Skeleton theme's existing Shopify behavior. Product, collection, search, cart, locale, and checkout handoff logic remain data-driven. No product, collection, inventory, checkout, or production-store data was changed.

The requested reference image was not present in the supplied attachment directory; only the written Task 10 brief was available. The redesign therefore follows the brief's explicit requirements and the existing SalamShop brand direction rather than claiming pixel parity with an unavailable image.

## Visual direction

- Warm off-white page and surface hierarchy instead of pure-white, border-led panels.
- Gold-brown primary actions with a cream primary container and dark brown on-container text.
- Expressive 24–28 px cards and containers, pill buttons and controls, circular icon buttons, and restrained elevation.
- Serif display headings paired with Work Sans body and control typography.
- Tonal grouping, spacing, and type hierarchy communicate structure before borders do.
- Motion remains subtle and honors `prefers-reduced-motion`.

The primary action color is `#8F6F3E`. It is slightly darker than the initial visual target so white button text reaches a measured 4.66:1 contrast ratio.

## Material tokens

| Role | Default |
| --- | --- |
| Background / surface | `#FFFCF7` |
| Secondary surface | `#F3EDE3` |
| Surface low | `#FAF5ED` |
| Surface high | `#EDE5D8` |
| Primary | `#8F6F3E` |
| On primary | `#FFFFFF` |
| Primary container | `#F0E2CA` |
| On primary container | `#49391E` |
| On-surface variant | `#625C52` |
| Outline | `#81796B` |
| Card radius | 24 px |
| Button radius | 50 px |
| Input radius | 24 px |

Merchants can change these values in the theme editor. The shape scale offers Compact, Soft, and Expressive presets; Expressive is the default.

## Navigation and responsive behavior

- Mobile (`< 48rem`): fixed bottom navigation using up to four links from a merchant-selected menu.
- Tablet (`48rem–63.999rem`): the same navigation becomes a compact left rail.
- Desktop (`>= 64rem`): the existing full header navigation remains authoritative and the bottom navigation is hidden.
- Active destinations expose `aria-current="page"`; touch targets are at least 48 px and safe-area insets are respected.
- The header retains its no-JavaScript menu fallback, predictive search, account link, live cart count, and drawer behavior.

The preview store's current `main-menu` contains the merchant-authored titles “Home”, “Catalog”, and “Contact”. These are store navigation data, not theme locale strings. Rename those menu items in Shopify Navigation when Swedish storefront content is finalized; the theme deliberately does not overwrite merchant data.

## Commerce presentation

Product pages now provide a rounded gallery, optional breadcrumbs, clearer title and price hierarchy, pill variant choices, explicit selected/unavailable states, a tonal information surface, rounded disclosures, and a mobile sticky purchase panel. Merchants can choose a balanced or gallery-wide desktop layout and a plain or tonal information surface.

Collection pages use tonal introductions, rounded filter and sort surfaces, expressive product cards, and pill pagination. Search, homepage, footer, cart page, and cart drawer share the same tokens and component language.

The optional floating cart uses the real Shopify cart count and up to three real line-item images. It opens the existing cart drawer when drawer behavior is selected and links to the cart page otherwise. It is hidden when the cart is empty and no wishlist, review score, rating, or synthetic product data is introduced.

## Theme editor controls

- Material role colors and surface roles
- Button, card, and input radii
- Compact, Soft, or Expressive shape scale
- Bottom navigation enable/disable and menu selection
- Floating cart enable/disable
- Product breadcrumbs, desktop gallery ratio, and information-surface treatment

All new schema labels and help text exist in both Swedish and English locale files.

## Accessibility and performance

- Visible keyboard focus, semantic buttons/links, dialog behavior, screen-reader cart labels, and active-page state are preserved.
- Primary actions meet WCAG AA contrast for normal text; the automated design-system check also verifies the main surface pairs.
- Content remains usable without JavaScript through native links, forms, and header fallbacks.
- No CSS or JavaScript framework was added. The bottom navigation is Liquid and CSS only; the floating cart reuses existing cart drawer JavaScript.
- Product images keep Shopify responsive image generation and lazy loading where appropriate.

The final source payload contains 77,500 bytes of CSS and 39,151 bytes of JavaScript across 19 asset files. Relative to the Task 09 source baseline, the Material presentation added 17,390 bytes of CSS and no JavaScript.

A valid local-development Lighthouse run against the rendered homepage recorded 69 performance, 96 accessibility, 54 best practices, and 92 SEO, with FCP/LCP at 3.0 s, 820 ms total blocking time, zero layout shift, and 4,486 KiB transferred. The transfer and blocking time were dominated by Shopify-hosted checkout, privacy, and pixel resources; the largest checkout resource alone was 1,635 KiB. Local HTTP, third-party cookies, Shopify console/Inspector messages, and the store's missing merchant meta description account for the best-practices and SEO deductions.

Lighthouse's only theme accessibility finding was insufficient contrast on small homepage eyebrow text. That text was changed from the primary gold to the darker on-primary-container role. A subsequent Lighthouse process was redirected to the development store password page, so its password-page scores are intentionally excluded. The corrected role pair is covered by the static contrast and Material regression checks; repeat the browser audit with an authenticated preview session before release.

## Visual QA performed

The local Shopify preview at `127.0.0.1:9393` was inspected in the in-app browser with live development-store data. The rendered checks covered:

- Homepage hero, category surface, fixed mobile navigation, and floating cart
- Collection introduction, localized filter/sort controls, badges, and product grid
- Product breadcrumbs, responsive gallery, mobile sticky purchase panel, and real imagery
- Cart drawer hierarchy, line-item controls, subtotal, checkout handoff, and continue-shopping action

The in-app browser viewport was approximately 704 × 883 px, exercising the compact responsive state. A narrow centered-header wrap found during this pass was corrected. A before screenshot could not be produced after implementation because no baseline capture or reference image was supplied; the browser review is recorded as an honest rendered verification rather than a fabricated comparison.

## Maintenance checks

Run these from the theme root:

```powershell
node scripts/validate-material3.cjs
node scripts/validate-design-system.cjs
node scripts/validate-locales.cjs
shopify theme check
```

Before publishing, test configured merchant menus in Swedish, verify a representative product with multiple option types, test empty and populated carts, and repeat visual checks at 320, 390, 768, 1024, and 1440 px. Publishing remains a separate, explicit merchant action.
