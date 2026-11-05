# Task 11C product page visual review

Reviewed on 2026-11-05 in the user-started Shopify development preview at `http://127.0.0.1:9292`. The 390px Sedef Hijab view is the primary acceptance capture.

## Reference measurements

The center panel of `design/reference/salamshop-approved-design.png` is approximately 364px wide. Measurements are approximate image pixels. The storefront uses the existing SalamShop spacing and color tokens.

| Reference detail | Observed geometry | Implementation |
| --- | --- | --- |
| Header | Back icon around x815 and gold logo around x854–955. Search and cart sit on the right | Compact shared header with merchant logo setting, menu, search and cart. The breadcrumb's first link provides a back-to-home arrow |
| Breadcrumbs | About 13px text, 20px inset and 12–14px before the gallery | Small wrapping breadcrumb with the current or first real collection where available |
| Gallery | 326 × 228px, about 20px corners in the composite | 10:7 editorial frame and 24px default radius. Full product images fit inside the frame |
| Thumbnails | Roughly 76 × 56px with 8–9px gaps | Scrollable 10:7 thumbnails with rounded corners and a gold selection ring. Native image, video, external video and model rendering are supported |
| Title and price | About 25px title and 24px price separated by a few pixels | Compact heading and price stack with Shopify money formatting, conditional compare price and a configurable tax note |
| Swatches | About 34px circles with a two-ring selected state | 30px Shopify color/image swatches in 44px targets. Accessible names remain available. Options without a swatch use a text chip |
| Size | Small pill with gold selection and tonal alternatives | 44px minimum hit area, selected gold fill and distinct dashed/struck unavailable labels |
| Purchase | About 48px high gold pill with a cart icon | Full-width gold pill with bag icon, loading feedback and existing quantity, error and sold-out states |
| Information | Beige rows about 40px high, about 8px apart | Closed-by-default disclosures with 48px minimum rows and chevrons. Actual descriptions, metafields and eligible size guides supply the content |
| Bottom navigation | Full-width dock about 78px high including a soft selected tile | Product-specific 72px dock with safe-area inset and merchant menu links. Current-page styling follows real link state |
| Vertical rhythm | About 13px from main media to thumbs and about 18px from thumbs to title | Compact 8–16px gallery/heading spacing and shorter purchase groups. The sticky purchase control appears after passing the inline action |

## Changes

- `assets/product.css` defines the responsive product grid, media ratios, swatches, option pills, disclosures and bottom dock spacing. The main gallery and information stack at 320px and 390px. The tested 768px tablet uses two columns with thumbnails below and a bottom dock. At 1024px and wider the desktop gallery can use its merchant-selected side thumbnails. Product pages use a bottom dock at tablet widths to preserve gallery width.
- `sections/product.liquid`, `snippets/product-media-gallery.liquid`, `snippets/product-metafield-block.liquid`, `snippets/product-size-guide.liquid` and `snippets/header-icon.liquid` supply product navigation, accessible option markup, media/zoom affordances and the disclosure rows. The size-guide block retains its configured option-name match and page or metafield content.
- `assets/product.js` adds arrow-key and Space support to enhanced radio groups. The original links remain usable as direct variant destinations. Shopify resolves `option_values` and renders the section, including selected options, variant-specific media, availability and price. The existing Ajax cart integration and native form remain the purchase paths.
- `templates/product.json` selects the new Editorial image ratio and plain information surface for the starter template. The editor keeps Natural, Square and Portrait options, as well as layout, thumbnails, zoom, quantity, dynamic checkout, sticky purchase, content blocks and related products. The new ratio and loading label are synchronized in Swedish and English locale files.

## Visual iteration

| Largest initial difference | Correction |
| --- | --- |
| The tall portrait gallery pushed the title well down the mobile page | The 390px gallery now measures 335 × 235px. The rounded frame contains the full portrait photograph |
| Desktop-style extra gutters narrowed the mobile product stack | The product layout uses the section grid's existing gutters, placing breadcrumbs, media and copy on the same edges |
| The mobile gallery exposed two scrollbars and a tall thumbnail area | The enhanced gallery displays one active media item. Its separate thumbnail strip retains scrolling and keyboard selection |
| The first 390px pass wrapped the seventh swatch and placed the quantity label on a separate line | Four-pixel swatch gaps fit all seven 44px targets on one row at 390px. The quantity label now sits beside the stepper |
| The sticky button appeared while the inline action was still below the viewport, and the information began expanded | The sticky action waits until the inline button has passed above the viewport. Details start closed and use tonal rows with chevrons |

The actual photography is a tall mannequin image, while the reference uses a wide portrait of a person wearing the hijab. The beige sides reflect the decision to show the whole image inside the requested frame. The original gold logo is still unconfigured, so the shared header shows the store-name fallback. The navigation still reflects the configured Home, Catalog and Contact destinations. The mockup's Back control is represented by the home breadcrumb arrow, keeping the shared mobile menu available.

The development Sedef Hijab has seven colors at 99,00 SEK and no separate size selector. Its actual detail rows are Mer information, Mått and Tvättråd och skötsel. A dedicated size-guide row requires a matching product option and guide content. The configured tax note, quantity controls and Shopify accelerated checkout account for additional visible space. The merchant can select the original logo, approved product imagery, intended menu, available metafields and preferred purchase settings in the Theme Editor.

## Screenshot evidence

These JPEGs are actual viewport captures. Exported dimensions differ from browser viewport settings.

| Width | Gallery CSS pixels | Screenshot |
| --- | --- | --- |
| 320px | 265 × 186 | [Mobile 320](../design/baseline/task-11c/after-320.jpg) |
| 390px | 335 × 235 | [Primary mobile review](../design/baseline/task-11c/after-390.jpg) |
| 768px | 380 × 266 | [Tablet](../design/baseline/task-11c/after-768.jpg) |
| 1024px | 448 × 314 | [Compact desktop](../design/baseline/task-11c/after-1024.jpg) |
| 1440px | 626 × 438 | [Wide desktop](../design/baseline/task-11c/after-1440.jpg) |

[Before at 390px](../design/baseline/task-11c/before-390.jpg) · [First iteration](../design/baseline/task-11c/iteration-390.jpg) · [Sticky controls](../design/baseline/task-11c/sticky-390.jpg) · [Ajax cart test](../design/baseline/task-11c/cart-test.jpg)

The document client and scroll widths matched at all five tested widths. On the measured 390px scroll state the sticky control ended at y920 and the dock began at about y928. Browser errors and warnings were empty in the captured log. Metrics and the seven Sedef variant results are saved alongside the screenshots.

## Real product checks

| Product or flow | Observed result |
| --- | --- |
| Sedef Hijab | All seven colors resolved at 99,00 SEK with seven distinct active media IDs. ArrowRight selected Mauve from Beige. Enter selected a thumbnail. The zoom dialog opened and Escape closed it |
| Islamisk mössa – stickad modell | Seven colors appeared available. Svart resolved at 29,00 SEK with Add to Cart enabled |
| Imarat Thobe II | Svart XL and Svart 4XL displayed 389,00 SEK. Selecting Blå kept 4XL selected at 379,00 SEK, changed the active image and disabled the sold-out purchase action. Reloading its variant URL reproduced the selection and price |
| Miswak Original | Rendered with zero option groups, a 49,00 SEK price and enabled purchase button. Its form action was `/cart/add` |
| Quantity and cart | Quantity changed 1 → 2 → 1. Sticky Add to Cart opened the drawer with one Mauve hijab at 99,00 SEK. The test line was removed and the cart returned to empty |
| Information | The Sedef description disclosure opened in the browser. Its dimensions and care rows reflected real metafields |

Native form fallback, size-guide and recommendations wiring are covered by the existing validators. Browser coverage was limited to the four observed products and their available data. A JavaScript-disabled purchase, very high variant count, video/3D playback, a populated size guide, related-product rendering, a physical safe-area device and a full WCAG audit remain outside the verified browser results.

## Automated validation

All ten existing validators passed, covering locale, design system, header, search, homepage, collection, product, cart, Material 3 and launch readiness. All theme JavaScript passed `node --check`. Shopify Theme Check returned zero errors, warnings and informational findings. `git diff --check` passed.

The local changes were reviewed through the user-started development preview. Work stopped at Task 11C.
