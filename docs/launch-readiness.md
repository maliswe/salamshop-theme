# SalamShop 2.0 launch-readiness report

Audit date: 2026-11-05  
Scope: current `main` branch, SalamShop Development, theme code only  
Recommendation: **Not ready**

## Executive summary

The storefront code is stable, Swedish-first, dependency-light and substantially more accessible than the original Skeleton baseline. All theme validators and Shopify Theme Check pass. The major shopping components have native fallbacks, responsive images, scoped JavaScript lifecycles, focus management and reduced-motion handling.

The audit fixed confirmed theme-level defects in landmarks, accessible cart naming, secondary templates, social metadata, product-media priority, responsive content images, footer semantics, password-form attributes and section-group JSON. The homepage Lighthouse accessibility score improved from 98 to 100 and its local mobile performance score improved from 85 to 87.

The store is not ready for publication because launch-critical merchant content is still unconfigured: the repository's homepage contains no selected category collections, featured collection, new-arrivals collection, hero/category/editorial photography or footer menu. The audited homepage transferred no image resources, so the final original logo and photography could not be verified in the measured preview. Store policies, navigation, production references and production-only app behavior also require merchant verification.

The development-store password gate blocked the complete viewport matrix, secondary-page browser audit, Theme Editor mutation tests, real-device testing, checkout variant verification in this task, and assistive-technology testing. These results must not be inferred from static checks.

## Confirmed strengths

- Swedish and English locale parity, with Swedish as the source locale.
- No third-party theme JavaScript dependency.
- Native forms and links remain functional without JavaScript.
- Cart mutations use locale-aware Shopify Ajax endpoints and exact line keys.
- Header, search, filter and cart controllers avoid duplicate listener registration.
- Responsive image `srcset`/`sizes` coverage on primary commerce surfaces.
- Homepage hero uses eager loading and high fetch priority; active product media now does the same.
- Default color combinations exceed WCAG AA contrast targets.
- Focus-visible styling, dialog focus restoration, live cart/search announcements and reduced-motion rules are present.
- Shopify product structured data is generated from the actual product object.
- Canonical URL and Open Graph/Twitter metadata are present.

## Issue register

### LR-01 — Missing launch imagery and collection assignments

- Severity: **High**
- Affected: Homepage, header branding, product discovery
- Reproduction: Inspect `templates/index.json` and load the measured homepage.
- Expected: Original SalamShop logo, approved hero/category/editorial images, seven linked collections, featured products and new arrivals.
- Actual: Category blocks have labels but no collection references; featured/new-arrivals sections have no selected collections; image settings are blank; the measured homepage made zero image requests.
- Proposed resolution: Upload approved assets to the target store, select the original logo without alteration, assign seven collections, select featured/new-arrivals collections and verify image crops at all breakpoints.
- Status: **Open — merchant launch blocker**

### LR-02 — Footer policy/navigation menu is unconfigured

- Severity: **High**
- Affected: Footer, trust and policy access
- Reproduction: Inspect `sections/footer-group.json`; `menu` is empty.
- Expected: Contact, About, delivery, returns, privacy and terms links are reachable from the footer where the corresponding approved pages/policies exist.
- Actual: The theme renders a graceful footer but no link menu is assigned.
- Proposed resolution: Create or approve the production footer menu and assign existing policy/pages. Do not invent legal text.
- Status: **Open — merchant launch blocker**

### LR-03 — Product option labels need catalog approval

- Severity: **Medium**
- Affected: Product pages, filters, multilingual presentation
- Reproduction: Open Islamisk mössa and Imarat Thobe II in the development catalog.
- Expected: Consistent Swedish option names such as `Färg` and `Storlek`.
- Actual: Development data exposed `Color` and lowercase `storlek` on representative products.
- Proposed resolution: Merchant reviews integrations and filters, then corrects product option names in catalog data if safe.
- Status: **Open — product-data task; intentionally not changed by the theme**

### LR-04 — Homepage meta description is absent

- Severity: **Medium**
- Affected: Homepage SEO
- Reproduction: Run Lighthouse SEO against the authenticated local homepage.
- Expected: A concise, approved Swedish homepage meta description.
- Actual: Neither `page_description` nor `shop.description` supplied content; Lighthouse SEO remained 92.
- Proposed resolution: Add approved store-level homepage SEO copy in Shopify. The theme now safely falls back to `shop.description` when available.
- Status: **Open — merchant SEO task**

### LR-05 — Browser/device/accessibility matrix is incomplete

- Severity: **High**
- Affected: Whole storefront
- Reproduction: Open a fresh development preview session; it redirects to `/password`.
- Expected: Test 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px; 200% zoom; real iOS/Android; NVDA/VoiceOver; back/forward; shopping journey; secondary templates.
- Actual: The password gate blocked a fresh browser session. Only the authenticated homepage Lighthouse run and earlier product/cart interaction evidence were available.
- Proposed resolution: Provide a temporary QA preview/password or merchant-operated session, then execute the matrix and record screenshots/results.
- Status: **Open — verification blocker**

### LR-06 — Theme Editor mutation testing is incomplete

- Severity: **Medium**
- Affected: All configurable sections and blocks
- Reproduction: Attempt a new Theme Editor browser session during the audit.
- Expected: Add/remove/reorder/duplicate sections and blocks; change settings; verify live reload without listener multiplication; restore original settings.
- Actual: Browser access was password-gated. Static schemas, presets, JSON composition and lifecycle validators pass, but mutations were not performed.
- Proposed resolution: Run the editor checklist on an unpublished development copy and restore or discard test settings.
- Status: **Open — pre-publication verification**

### LR-07 — Development lab performance includes substantial platform overhead

- Severity: **Low**
- Affected: Performance interpretation
- Reproduction: Run Lighthouse on `http://127.0.0.1:9393/` through Shopify CLI.
- Expected: Diagnostic lab data representative enough to guide theme work.
- Actual: 4.47 MiB and 238 requests included Shopify preview, checkout-web, privacy, analytics and hot-reload resources. Theme-owned homepage assets were about 64.3 KiB over nine requests.
- Proposed resolution: Re-run Lighthouse on an unpublished HTTPS production preview with hot reload disabled and compare with Shopify Web Performance field data after traffic exists.
- Status: **Accepted limitation**

### LR-08 — Missing main landmark and skip navigation

- Severity: **High**
- Affected: All standard and password-layout pages
- Reproduction: Run Lighthouse accessibility on the baseline homepage or inspect the baseline layout.
- Expected: One main landmark and a visible-on-focus skip link.
- Actual: `content_for_layout` was rendered directly in the body.
- Proposed resolution: Wrap storefront content in `main#MainContent` and provide a translated skip link.
- Status: **Fixed**

### LR-09 — Cart icon accessible-name mismatch

- Severity: **Medium**
- Affected: Header cart link
- Reproduction: Run Lighthouse accessibility with a visible cart count.
- Expected: Visible count and accessible name agree.
- Actual: The link used an `aria-label` while also rendering a separate visible count, triggering label/content mismatch.
- Proposed resolution: Use real visually-hidden localized text as the accessible name and update it with the count fallback.
- Status: **Fixed**

### LR-10 — Bare Skeleton secondary templates

- Severity: **Medium**
- Affected: Page, blog, article, list collections, 404 and password templates; footer
- Reproduction: Inspect their baseline sections.
- Expected: Consistent container widths, typography, cards, responsive media, forms and empty states.
- Actual: Most sections were unstructured or minimally styled.
- Proposed resolution: Add a shared, template-scoped secondary stylesheet and semantic markup without redesigning merchant content.
- Status: **Fixed**

### LR-11 — Active product image was lazy-loaded

- Severity: **Medium**
- Affected: Product pages
- Reproduction: Inspect `snippets/product-media-gallery.liquid` before the fix.
- Expected: The active/LCP candidate loads eagerly with high priority; hidden gallery media remain lazy.
- Actual: Every gallery image used `loading="lazy"`.
- Proposed resolution: Set eager/high priority only for the active media.
- Status: **Fixed**

### LR-12 — Social image metadata lacked alternative text

- Severity: **Low**
- Affected: Product/article social sharing
- Reproduction: Inspect baseline `snippets/meta-tags.liquid`.
- Expected: Open Graph/Twitter image and alt metadata use actual Shopify image/title data.
- Actual: Open Graph image existed, but image alt and Twitter image metadata did not.
- Proposed resolution: Add escaped image-alt/title fallbacks without fabricating content.
- Status: **Fixed**

### LR-13 — Section-group JSON contained a trailing comma

- Severity: **Medium**
- Affected: Header group portability and strict tooling
- Reproduction: Strip Shopify's generated comment header and parse `sections/header-group.json` as JSON.
- Expected: Valid JSON.
- Actual: A trailing comma followed the `order` array.
- Proposed resolution: Remove the comma and add strict regression parsing.
- Status: **Fixed**

### LR-14 — Orphaned responsive-image example snippet

- Severity: **Low**
- Affected: Repository maintenance
- Reproduction: Run Theme Check after replacing the last call site.
- Expected: No orphaned snippets.
- Actual: `snippets/image.liquid` had no consumers.
- Proposed resolution: Remove the confirmed orphan.
- Status: **Fixed**

## Validation evidence

### Automated validation

All passed after the fixes:

- Locale validation: 159 storefront keys and 255 schema keys per language; parity, placeholders and HTML passed.
- Design-system validation: 35 settings and all default contrast checks passed.
- Header, search, homepage, collection, product and cart validators passed.
- Launch-readiness regression passed.
- Syntax checks passed for all six JavaScript assets.
- `shopify theme check`: 65 files, zero offenses.
- `git diff --check`: passed; Git emitted informational future LF-to-CRLF conversion warnings only.

### Lighthouse measurements

Mobile simulated lab run, local Shopify CLI preview, Chromium-based browser:

| Homepage metric | Before | After |
| --- | ---: | ---: |
| Performance | 85 | 87 |
| Accessibility | 98 | 100 |
| Best Practices | 54 | 54 |
| SEO | 92 | 92 |
| FCP | 2.8 s | 2.8 s |
| LCP | 2.8 s | 2.8 s |
| TBT | 260 ms | 230 ms |
| CLS | 0 | 0 |
| Speed Index | 3.1 s | 2.8 s |
| Total transfer | 4,475 KiB | 4,474 KiB |
| Requests | 239 | 238 |

Notes:

- INP is a field metric and was unavailable from this lab run; TBT is reported as a diagnostic proxy, not an INP substitute.
- Best Practices is reduced by local HTTP, Shopify preview CORS/console diagnostics and third-party cookie behavior.
- Theme-owned homepage files transferred approximately 64.3 KiB across nine requests. Repository source assets total 124,746 bytes: 60,110 bytes CSS and 39,151 bytes JavaScript, before compression.
- Collection, product, search and cart Lighthouse attempts resolved to `/password`; their scores describe the password page and are discarded.
- Shopify Theme Inspector was not available in this repository/session.

### Browser and shopping regression evidence

Previously verified in the current development theme work:

- Sedef Hijab separate Beige/Mauve variants.
- Islamisk mössa available-color addition.
- Imarat Thobe II unavailable option and valid `Svart / XL` addition.
- Ajax cart drawer, quantity increase, total/count synchronization, persistence, full cart page and Escape focus restoration.
- Checkout handoff reached Shopify's development password gate; no order was placed.

Not verified in this audit because of the password gate:

- Complete homepage-to-checkout journey in one fresh session.
- Removal-to-empty-cart browser state and live discount data.
- Browser back/forward after filter and variant changes.
- Exact responsive viewport matrix and 200% zoom.
- Real iOS Safari or Android Chrome.
- NVDA, VoiceOver or other manual assistive technology.
- Theme Editor mutations and section reload behavior.

### Accessibility findings

- Automated homepage accessibility: 100 after fixes.
- Default contrast ratios range from 6.33:1 to 14.30:1 for tested text/control combinations.
- Skip navigation and one main landmark now exist in both layouts.
- Cart/search/error states use status or alert announcements.
- Native dialogs and focus restoration are covered by component tests.
- Logical CSS and conditional `dir` provide a structural RTL starting point.
- Arabic translations, typography, bidirectional content, screen-reader output and mirrored visual QA do not exist yet; Arabic is not production-ready.

## SEO review

- Page title composition, canonical URL and page-description hooks are present.
- Product JSON-LD comes from Shopify's `product | structured_data`; no fabricated ratings or offers are added.
- Open Graph/Twitter title, description, image and image-alt metadata are present after the fix.
- Collection breadcrumbs are semantic but do not currently emit breadcrumb JSON-LD; this is a non-blocking enhancement.
- Shopify pagination output and internal collection/product links remain native.
- The 404 page has a clear Swedish message and recovery action.
- Merchant action: provide homepage meta description, collection descriptions/images and meaningful uploaded-image alt text.

## Trust, policy and homepage checklist

- [ ] Original gold SalamShop logo uploaded and verified unchanged.
- [ ] Final hero and mobile hero photography approved and selected.
- [ ] Seven category collections assigned with final images/crops.
- [ ] Featured-products collection assigned.
- [ ] New-arrivals collection assigned.
- [ ] Brand-value section reviewed and intentionally enabled or left disabled.
- [ ] Newsletter consent/copy reviewed against the merchant's privacy process.
- [ ] Contact page available and linked.
- [ ] About SalamShop page available and linked.
- [ ] Delivery information available and linked.
- [ ] Return/refund policy approved and linked.
- [ ] Privacy policy approved and linked.
- [ ] Terms of service approved and linked.
- [ ] Footer and main navigation menus assigned.
- [ ] Product material, size-guide and care metafields reviewed.
- [ ] `Color`/`storlek` product-option labels reviewed before any catalog change.

## Development-to-production migration plan

Development and production are separate stores. A theme upload does not migrate store data.

1. **Theme code** — package or push the reviewed code to a new unpublished production theme. Do not overwrite the live theme.
2. **Theme settings** — reproduce approved global and section settings. Store-specific picker values may not resolve automatically.
3. **Uploaded media/assets** — upload the original logo and approved photography to production, then reselect each image picker.
4. **Navigation menus** — create/verify production main and footer menus, then assign them in header/footer settings.
5. **Collection references** — map all seven category, featured, new-arrival, cart-empty and CTA collection references to production collections.
6. **Product references** — verify featured products/recommendations and any product pickers against production product IDs/handles.
7. **Metafields** — create matching definitions first, then migrate approved product material, dimensions, care, head circumference and related content.
8. **Pages and size guides** — create or migrate About, Contact, policy-supporting pages and size guides; rebind page-picker settings.
9. **Apps and app blocks** — install/configure approved production apps separately and add app blocks only after privacy/performance review.
10. **Store-level settings** — configure domains, markets, languages, policies, payments, shipping, taxes, customer accounts, analytics, consent and SEO independently.

Settings likely to require reassignment include image pickers, logo, link-list menus, collection pickers, page pickers, product pickers, metafield-backed content, app blocks and any `shopify://` resource references.

### Unpublished production verification

1. Back up/download the current production theme and record its theme ID/settings.
2. Upload the reviewed SalamShop 2.0 code as a **new unpublished theme**.
3. Rebind production media, menus, collections, pages, metafields and app blocks.
4. Preview using Shopify's unpublished-theme preview URL; do not publish.
5. Run Theme Check, locale validation and the complete browser/device/assistive-technology matrix.
6. Test search, filters, representative products, variants, cart, discounts and checkout handoff with production-safe test conditions; do not place a real order unless separately authorized.
7. Compare analytics, consent, pixels, app embeds, shipping/tax presentation and policy links with the current live store.
8. Obtain explicit merchant approval for content, legal links and publication timing.
9. Publish only through an approved change window.
10. Roll back by republishing the backed-up prior theme if a material defect appears.

## Final recommendation

**Not ready.**

The theme code is a strong candidate for an unpublished production preview, but publication should wait until launch imagery, logo, collections, navigation, policies and SEO content are configured; store-specific references are rebound; and the blocked responsive, real-device, assistive-technology, Theme Editor and end-to-end production-preview tests pass. No production installation, publication, deployment, push or commit was performed during this audit.
