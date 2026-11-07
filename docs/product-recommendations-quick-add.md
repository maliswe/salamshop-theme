# Product recommendations with quick add

## Architecture

The existing recommendation section remains immediately after the main product section in `templates/product.json`. The original four-product configuration is preserved. It uses the locale-aware `routes.product_recommendations_url`, section rendering and the native Liquid `recommendations` object with `related` intent. The configurable count supports 2–10 results, within [Shopify's documented API limit](https://shopify.dev/docs/api/ajax/reference/product-recommendations).

The server excludes the current product and duplicate IDs. Only actual returned products render. A visible section wrapper triggers one lazy request; in-flight and completed guards prevent unnecessary duplicate requests. Empty, invalid, HTTP-error or failed-network responses remain hidden, including the outer section spacing. There is no invented collection fallback in the recommendation grid.

## Shared cards and purchase safety

Cards use the existing `product-card.liquid`, premium modifier and shared CSS. Recommendation-only parameters control prices, sale/availability badges and actions; homepage, collection and search action behavior is unchanged. The new `recommendation-card-action.liquid` owns only the footer action, not a second card design.

Direct add requires all of the following:

- Exactly one variant, Shopify's default-variant-only flag, and an available variant.
- No selling-plan requirement or selling-plan groups.
- No custom product-template suffix.
- No merchant quick-add exclusion or true `custom.requires_personalization` / `custom.quick_add_disabled` boolean flag.

Eligible products have a native Shopify product form with the real variant ID and quantity 1. Products requiring decisions show “Välj alternativ” and retain their actual product URL, including Shopify recommendation tracking. Sold-out products have a disabled “Slutsåld” action while their image/title link remains usable. Prices and genuine badges remain server-derived.

## Cart integration and recovery

The delegated submit handler calls `window.SalamCart.addProduct(form, { trigger: button })`; it does not fetch a separate cart endpoint or calculate totals. The existing cart engine supplies locale-aware URLs, bundled section rendering, header/floating counts, subtotal and drawer synchronization. The optional trigger parameter restores keyboard focus to the originating recommendation button when the drawer closes; existing product-page callers keep their prior interface.

Busy forms disable the button, set `aria-busy`, announce loading and reject duplicate submissions. Success announces the existing localized cart message. Confirmed server failures display the server error and allow an intentional retry. An uncertain transport/rendering failure disables further submissions from that form and exposes a cart-inspection link; it never automatically retries the mutation. A reload can start a fresh interaction after the customer checks the cart.

The cart engine's non-mutating section/count recovery is reused. A successful add followed by missing or failed section rendering never replays the add request.

Native forms remain valid when cart enhancement is absent or the merchant selects cart-page behavior. Shopify recommendations themselves require a browser fetch on the initial product page; with JavaScript fully disabled, a noscript discovery link leads to the real all-products collection instead of showing invented recommendations. No checkout behavior changed.

## Merchant settings

Existing enable, heading, count, desktop columns, media ratio and fit remain. New translated settings control price visibility, badge visibility, action visibility and a product exclusion list for additional customer inputs. The heading schema default is localized; the existing Swedish configured heading is preserved.

Use the exclusion list for default-template products that require personalization, app-provided choices, line-item properties or other required input. Arbitrary app requirements cannot be inferred reliably from Shopify's standard product fields. No metafields, product tags, prices, stock or catalog settings were created or changed.

## Accessibility and responsive presentation

The section has a named heading. Product links and actions are separate siblings; forms are never nested inside links. Buttons have product-specific accessible names, visible focus, live loading/success status and alert errors. Native disabled states prevent sold-out purchases. Existing reduced-motion rules apply.

Cards use one column at 320px, two at 390/768px, three at 1024px and four at 1440/1920px for the configured four-column layout. A recommendation footer grid keeps long Swedish actions beneath prices without spilling into neighboring cards. Measured targets were at least 44px tall; narrow two-column Add to Cart labels wrap naturally. Main product sticky purchase and bottom navigation remain unchanged.

## Browser evidence

Local development preview: `http://127.0.0.1:9292`.

- On Islamisk mössa, four native recommendations rendered: one option-based prayer mat linked to “Välj alternativ”; three eligible single-variant mats showed direct add.
- Sejjade I Bönematta Pink quick add opened the existing drawer with the correct product/variant and quantity 1. Header and floating counts both became 1; server subtotal was 149 SEK. Closing returned focus to the quick-add button.
- Reload preserved quantity 1 and the 149 SEK subtotal. The test item was removed; the final cart count is 0.
- The “Välj alternativ” card opened Barn ll Bönematta's product page, where an option group remained available; cart count stayed 0.
- A temporary ten-result profile returned ten real products without the current product or duplicates. NamnBöneMatta also used “Välj alternativ.” The original four-result template was restored.
- A temporary visibility/exclusion profile hid all recommendation prices/badges and changed the excluded simple product from quick add to “Välj alternativ.” Original settings were restored.
- At 320, 390, 768, 1024, 1440 and 1920px, all final actions remained inside their cards, their text fit and no horizontal page overflow appeared.
- Sedef Hijab returned no recommendations; the loaded empty section and its wrapper were hidden without blank spacing.

Screenshots and measurements are in `design/recommendations-quick-add/`: `recommendations-desktop-1440.jpg`, `recommendations-mobile-390.jpg`, `quick-add-cart-1440.jpg`, `empty-recommendations-sedef-1440.jpg`, and `verification.json`.

## Automated checks and remaining manual coverage

`validate-recommendations.cjs` exercises one-mutation duplicate protection, busy/success state, confirmed stock rejection, uncertain network failure/no replay, cart recovery links, native fallback, one recommendation request, HTTP/network/empty results, and connection/disconnection cleanup. Source checks cover default-only variant safety, selling plans, custom templates, exclusions, actual product URLs, deduplication and accessible markup.

Cart validation additionally checks the optional focus trigger and proves that a successful POST followed by failed rendering does not issue another mutation. All existing validators, asset JavaScript syntax checks, Shopify Theme Check and `git diff --check` pass.

The returned recommendation sets did not include Sedef Hijab, Islamisk mössa or Imarat Thobe II as cards, or sold-out products. Their named-option safety follows the same tested default-only eligibility guard; no recommendations were fabricated to force these examples. Live card checks for those particular products, selling plans and app-required inputs remain merchant-data-dependent. Stock/network failure paths were tested with controlled test doubles, without altering inventory or disrupting the live browser network. Full browser testing with JavaScript disabled remains manual; native form and noscript markup are validated.

No production, product, inventory, price, checkout, commit, push, deploy or publish operation was performed. Existing unrelated Git changes were preserved.
