# Product page reference redesign

## Structure and styling

Reviewed `design/reference/example.png` as the primary structural reference, alongside the approved SalamShop design. Breadcrumbs precede a centered product layout. At 1024px and above the default gallery-wide setting allocates 58% of the column space to media and 42% to purchasing details, with responsive spacing. Smaller widths stack gallery, thumbnails and information. Existing balanced-layout, aspect-ratio and surface settings remain available.

Thumbnails now default to below the primary image; the current product template is updated accordingly. Side placement remains configurable. Primary media uses contain by default, with tonal empty areas and a cover option. Real images, videos, external videos, models, variant media, thumbnail links and the existing zoom dialog remain supported. Media type labels and dialog backdrop now derive from theme tokens.

Information order: optional real collection label/vendor, title, variant price and compare-at price, tax note, optional real short description, variant availability, native option groups, configured size guide, quantity, gold Add to Cart, enabled accelerated checkout, then information accordions. Option order follows merchant product data. Size guides render only when a matching option and genuine guide page/metafield exist. Unbranded accelerated checkout receives tonal styling; branded payment controls and checkout behavior remain unchanged.

No reviews, inventory quantities, claims, wishlist controls, photos or colors were fabricated. Existing global tokens and the logo were preserved.

## Behavior and settings

The existing high-variant `option_values`/section-rendering path, real variant URLs, quantity preservation, native form fallback and `SalamCart` integration remain intact. JavaScript changes are limited to the desktop sticky-height guard and recommendation intersection target.

Sticky information requires the existing merchant setting, a desktop viewport and enough room beneath the measured sticky header. A ResizeObserver checks actual information height, including expanded accordions. Tall content returns to normal document flow. Observers and resize listeners are cleaned up during section replacement. The mobile sticky purchase bar and bottom dock remain in their existing positions.

New translated controls: primary-media contain/cover, collection-label visibility and short-description visibility. Existing gallery layout, aspect ratio, thumbnail position, zoom, surface, details blocks, size guide, checkout and sticky controls are preserved. Recommendations add the same image-fit control used by the shared card.

## Recommendations

The section remains underneath the product layout and uses Shopify's native related-products endpoint. It now opts into the same premium `product-card` snippet and shared CSS used by the homepage and collections, including genuine prices/badges and product-page CTA links. Its inner container aligns with the main product layout.

The loader previously observed a hidden unloaded element. It now observes the visible Shopify section wrapper so approaching the section can trigger the existing loader. Four native recommendations rendered on the knitted-cap product. Empty responses remain hidden; no fallback recommendations were invented.

## Verification

Local development preview tested:

- Sedef Hijab: 15 media items; color selection preserved quantity 2 and updated variant URL/media. Zoom opened with close-button focus and closed with Escape. A test Ajax add opened the drawer with the correct Mauve variant; the item was removed afterward, restoring the original empty cart.
- Islamisk mössa – stickad modell: native color swatches, media and four related products rendered. Mobile sticky purchase bar ended at approximately y=923 with the bottom dock starting at y=931 in the 1000px viewport, without overlap; floating cart remained hidden.
- Imarat Thobe II: 12 media items, actual color and size controls. Sold-out M disabled purchase and removed accelerated checkout. Changing from Svart/XL to Brun/XL updated price from 389 SEK to 379 SEK and changed media/URL.

All three products were measured at 320, 390, 768, 1024, 1440 and 1920px with no horizontal overflow. Desktop gallery/information alignment and the 58/42 split were checked. Expanding Sedef's description increased the information height to about 1451px and disabled stickiness. A 1440×700 viewport also left tall Thobe information static.

Evidence is in `design/product-reference-redesign/verification.json` and screenshots in the same directory: desktop/mobile examples, variant and sold-out states, gallery zoom, Ajax cart, recommendations and mobile sticky purchase.

Product validation adds behavioral tests for sticky height eligibility, cleanup, and triggering recommendations through their visible wrapper. Existing validators, all asset JavaScript syntax checks, Shopify Theme Check and `git diff --check` pass.

The three products contain real photography; their original framing and image quality are retained. No configured size-guide content appeared on these examples, so no guide was invented. Video/model rendering and catalogs above 250 variants remain covered structurally by the preserved implementation and validations, rather than a populated development-store example. Checkout was not submitted.

No production, catalog, inventory, price, checkout, commit, push or publish operations were performed.
