# SalamShop 2.0 final visual and release review

**Recommendation — NOT READY.** The local development storefront passed the repository checks and the sampled purchase flow. The original logo, approved campaign photography and footer policy links are still missing from the rendered preview. Live Theme Editor and assistive technology checks remain open. Merchant sign-off should use the configured storefront.

## Current local preview

Captured from the Shopify CLI storefront at `http://127.0.0.1:9292` on 2026-11-05. Widths are browser viewport settings in CSS pixels. JPEG dimensions may exclude scrollbars. The 320px homepage capture was refreshed after the final CSS fixes. Other 320px frames were captured before those fixes and can show the earlier dock padding. The tablet rail was off in the reviewed configuration. The 768px frame shows the dock and the 1024px frame shows desktop navigation.

| Surface | 320 | 390 | 768 | 1024 | 1440 | 1920 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| Homepage and mobile dock | [320](../design/baseline/task-11f/home-320.jpg) | [390](../design/baseline/task-11f/home-390.jpg) | [768](../design/baseline/task-11f/home-768.jpg) | [1024](../design/baseline/task-11f/home-1024.jpg) | [1440](../design/baseline/task-11f/home-1440.jpg) | [1920](../design/baseline/task-11f/home-1920.jpg) |
| Collection | [320](../design/baseline/task-11f/collection-320.jpg) | [390](../design/baseline/task-11f/collection-390.jpg) | [768](../design/baseline/task-11f/collection-768.jpg) | [1024](../design/baseline/task-11f/collection-1024.jpg) | [1440](../design/baseline/task-11f/collection-1440.jpg) | [1920](../design/baseline/task-11f/collection-1920.jpg) |
| Sedef Hijab | [320](../design/baseline/task-11f/product-320.jpg) | [390](../design/baseline/task-11f/product-390.jpg) | [768](../design/baseline/task-11f/product-768.jpg) | [1024](../design/baseline/task-11f/product-1024.jpg) | [1440](../design/baseline/task-11f/product-1440.jpg) | [1920](../design/baseline/task-11f/product-1920.jpg) |
| Predictive search | [320](../design/baseline/task-11f/predictive-320.jpg) | [390](../design/baseline/task-11f/predictive-390.jpg) | [768](../design/baseline/task-11f/predictive-768.jpg) | [1024](../design/baseline/task-11f/predictive-1024.jpg) | [1440](../design/baseline/task-11f/predictive-1440.jpg) | [1920](../design/baseline/task-11f/predictive-1920.jpg) |
| Search results | [320](../design/baseline/task-11f/search-results-320.jpg) | [390](../design/baseline/task-11f/search-results-390.jpg) | [768](../design/baseline/task-11f/search-results-768.jpg) | [1024](../design/baseline/task-11f/search-results-1024.jpg) | [1440](../design/baseline/task-11f/search-results-1440.jpg) | [1920](../design/baseline/task-11f/search-results-1920.jpg) |
| Cart drawer | [320](../design/baseline/task-11f/cart-drawer-320.jpg) | [390](../design/baseline/task-11f/cart-drawer-390.jpg) | [768](../design/baseline/task-11f/cart-drawer-768.jpg) | [1024](../design/baseline/task-11f/cart-drawer-1024.jpg) | [1440](../design/baseline/task-11f/cart-drawer-1440.jpg) | [1920](../design/baseline/task-11f/cart-drawer-1920.jpg) |
| Full cart | [320](../design/baseline/task-11f/cart-320.jpg) | [390](../design/baseline/task-11f/cart-390.jpg) | [768](../design/baseline/task-11f/cart-768.jpg) | [1024](../design/baseline/task-11f/cart-1024.jpg) | [1440](../design/baseline/task-11f/cart-1440.jpg) | [1920](../design/baseline/task-11f/cart-1920.jpg) |
| Empty cart | [320](../design/baseline/task-11f/empty-cart-320.jpg) | [390](../design/baseline/task-11f/empty-cart-390.jpg) | [768](../design/baseline/task-11f/empty-cart-768.jpg) | [1024](../design/baseline/task-11f/empty-cart-1024.jpg) | [1440](../design/baseline/task-11f/empty-cart-1440.jpg) | [1920](../design/baseline/task-11f/empty-cart-1920.jpg) |

The six widths reported one main landmark, one H1 and zero horizontal document overflow on the homepage, collection, product, full search, full cart and empty cart. Cart drawer captures also used the six widths. [DOM measurements](../design/baseline/task-11f/observations.json).

## Comparison with the approved design

| Classification | Observation |
| --- | --- |
| Implementation defect, fixed | At 320px, the dock split “Kategorier” before its last letter and three category columns split short labels. The dock now drops inline padding at 360px and below, keeping its 60px target height. The category grid uses two columns there. Verified at 320px with zero horizontal overflow. |
| Missing merchant content | The hero and editorial treatments use tonal fallbacks. Two category tiles display placeholders. The header shows a compact, two-line store-name fallback. These are the largest differences from the approved photography and brand treatment. |
| Different real product data | The product gallery uses the catalog's portrait imagery and actual variant options and price. The preview cart used Sedef Hijab in Mauve at 99,00 SEK per unit. |
| Intentional responsive adaptation | Collection and search cards use a shared image treatment. The gallery preserves portrait imagery within a wider frame. The cart drawer is inset on desktop and full height on mobile, with actions at the bottom. |
| Acceptable design variation | The cream canvas, warm text, rounded photography, gold pills and tonal controls are consistent. The preview has denser data and different typography weights than the artwork. The mobile dock uses working merchant and Shopify destinations. |

[Approved reference](../design/reference/salamshop-approved-design.png).

## Shopping and accessibility evidence

- The homepage CTA opened the Shopify catalog. In this review, search suggestions appeared for “hijab” at all six widths, Escape dismissed them, and Enter opened the full product results.
- Sedef Hijab initially showed Beige. Keyboard selection changed it to Mauve and keyboard submission opened the cart drawer. Increasing quantity to two produced a subtotal of 198,00 SEK. The line persisted on the full cart and was removed. The empty state rendered afterward.
- Islamisk mössa rendered an available Brun option. Imarat Thobe II rendered Svart / XL and marked Svart / M unavailable. These two products were inspected without placing test orders. Sedef showed dimensions and care sections. The full variant matrix, gallery interaction and size-guide content were not retested in this pass. [Product option observations](../design/baseline/task-11f/product-options.json).
- The 11E preview run verified the availability filter, sorting with filter retention, pagination, floating-cart synchronization and focus return, and native development checkout handoff. Those results supplement this pass. A fresh uninterrupted filter-to-checkout run was not completed. [Task 11E regression evidence](collection-search-cart-visual-approval.md).
- Automated checks found one main landmark and one H1 on the sampled page matrix. The design-system validator reported 14.60:1 default body text contrast and 4.71:1 primary button contrast. Live keyboard coverage included search dismissal and submission, variant selection and add to cart. Manual screen-reader use, 200% zoom, real-device safe areas, reduced-motion playback, RTL rendering and a full alternate-text review are pending. The Lighthouse score applies to the audited homepage only.

## Performance

A Lighthouse mobile lab run against the local homepage finished at the storefront root with HTTP 200 using headless Edge. The run preceded the final narrow category adjustment. It measures the preview with the current content and scripts. The original logo and campaign imagery still need a configured-theme run.

| Metric | Current lab run | Earlier launch audit |
| --- | ---: | ---: |
| Performance | 85 | 87 |
| Accessibility | 100 | 100 |
| SEO | 92 | 92 |
| LCP | 2.6 s | 2.8 s |
| CLS | 0 | 0 |
| TBT | 310 ms | 230 ms |

The current run recorded 255 requests and 5,017,391 bytes transferred. Matching CSS and JavaScript URLs against repository asset filenames identified 63,151 CSS bytes and 29,448 JavaScript bytes over ten requests, including two entries for `critical.css`. The remaining transfer includes Shopify and preview scripts, images, fonts and other resources. The older run had a different content and preview configuration. These single runs cannot establish a theme regression. The SEO audit flagged the missing meta description. [Lighthouse evidence](../design/baseline/task-11f/lighthouse-home.json) · [Earlier launch audit](launch-readiness.md).

## Merchant content and Theme Editor

| Area | Observed and required |
| --- | --- |
| Original logo | The preview renders the shop name. In the development theme, open **Customize → Theme settings → Brand → Logo** and upload or select the original file. **Header → Logo** controls display widths, which default to 180px desktop and 100px mobile. Static validation confirms the image picker schema and render path. Live picker operation and rendered logo checks at phone, tablet and desktop widths are pending. |
| Hero and editorial | Select approved desktop and mobile imagery in **Home hero**, and an approved image in **Home editorial**. Suggested desktop hero 2400 × 1150 (about 2.1:1), with clear space for text and the subject opposite it. Suggested mobile hero 900 × 1200 (3:4), composed for its own crop. Suggested editorial 1600 × 1200 (4:3), with the subject away from trim edges. Review focal points and overlay contrast in context. |
| Category tiles | All seven links render. Dofter och rökelse and Personlig vård show placeholders. Provide 600 × 600 square images with centered subjects and room around the edges. Confirm the seven labels and links as a set. |
| Product merchandising | Featured and New arrivals both currently reference the all-products collection. Select approved collections and confirm product ordering. Product media should be consistent, preferably 1200 × 1500 (4:5) with room around the garment. Confirm collection banners individually, with about 2000 × 1000 for wide crops and a separate mobile image when the subject needs reframing. |
| Navigation and policies | The desktop menu reads Home, Catalog and Contact. The footer has only the shop link. Approve Swedish menu labels and assign a footer menu with verified contact, delivery, returns, privacy and terms destinations. The current contact and policy content was not approved in this audit. |
| Catalog and discovery | Review product material, care, size guides and consistent product option labels. Availability and price filters rendered. Confirm color and size filter setup for the target catalog. |
| SEO, newsletter and localization | The homepage meta description is missing. The Swedish newsletter form renders, with delivery and consent configuration still to be confirmed. Theme locale parity passes for Swedish and English. Merchant menus, product data and policy copy need their own translations. Arabic needs translated strings and content plus RTL and assistive technology verification. |

The development Theme Editor redirected to Shopify account sign-in. Adding/removing/reordering sections and blocks, image and text edits, collection and typography changes, navigation, product, collection and cart settings, and live unload/load cycles remain open. The existing lifecycle validators passed. On an authenticated unpublished development copy, record settings, exercise each operation, repeat section reloads and confirm one action produces one handler response, then restore the recorded settings or discard the copy.

## Issue register

| Severity | Open issues |
| --- | --- |
| Critical | None observed in the sampled storefront flows. |
| High | Select the original logo and approved campaign assets. Assign and approve navigation and policy links. Complete Theme Editor, assistive technology and unpublished production smoke tests. |
| Medium | Approve homepage SEO, curated collections, filters, option labels, sizing and care content, contact details and newsletter configuration. Repeat the complete checkout handoff regression on the configured candidate. |
| Low | Recheck local lab measurements after content selection. Review crop, typography and spacing differences with the merchant. Arabic remains a separate localization milestone. |

## Git and production preparation

At review start, `main` and the local `origin/main` tracking ref pointed to `aa919b3`. The working tree contained 46 modified tracked paths and 10 untracked entries, including the 11A–11E theme code, docs, validator and evidence. The tracking ref was inspected locally. Remote freshness was not verified. Task 11F added the report and capture evidence and adjusted narrow layouts in `assets/critical.css` and `assets/homepage.css`.

1. Reconcile the working tree with the current GitHub base on a reviewed feature branch. Separate theme source, verification material and any store-local configuration. Review the full diff and rerun every validator before the authorized validation commit.
2. Synchronize the approved branch through GitHub review and tag the accepted release commit with the agreed version.
3. In a separately approved production change, back up the current published theme and record its ID and settings. Upload the accepted candidate as a separate unpublished theme.
4. Rebind production logo, media, menus, collections, pages, product/metafield references, size guides and app blocks. Verify markets, locale content, SEO, contact and policy destinations, consent and newsletter settings.
5. Run final storefront and Theme Editor smoke tests, device and assistive technology checks, and the checkout handoff on that unpublished candidate. Obtain explicit merchant publication approval and agree on timing and rollback triggers.
6. If a material regression follows publication, restore the backed-up previous theme and verify home, search, product, cart and checkout entry points.

## Automated validation

All ten existing validators passed, including locales, design system, header, search, homepage, collection, product, cart, Material 3 and launch readiness. Shopify Theme Check returned zero findings. JavaScript syntax checks and `git diff --check` passed.
