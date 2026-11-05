# Task 11E — Collection, search and cart visual review

The [approved reference](../design/reference/salamshop-approved-design.png) calls for image-led cards, a warm canvas, compact cart rows and gold checkout. It shows a desktop merchandising grid and a right-hand cart panel. Full collection, search and cart pages use those same visual rules where the reference does not show a complete page.

| Difference addressed | Result |
| --- | --- |
| The collection intro and repeated count pushed products down. | A compact introduction and single result count put the two-column mobile grid closer to the top. |
| Full search used a separate product layout. | Product results now render the same card as collection and homepage, with search image and price settings still applied. |
| Predictive suggestions needed clearer separation from the page. | A floating ivory panel, rounded thumbnails and tonal keyboard selection sit below the pill search field. |
| The cart drawer was a wide, nearly full-height stack of cards. | An inset desktop panel fits its content, with square thumbnails, thin dividers, compact controls and line prices next to the quantity where space allows. Mobile keeps a full-height modal. |
| The cart page and floating shortcut competed for space on mobile. | The summary stacks under the items, and the shortcut is suppressed on the cart page, behind open drawers, and during relevant input focus. Elsewhere it shows real thumbnails and count. |

## Preview evidence

Actual development storefront at `http://127.0.0.1:9292`. Desktop captures used a 1440 × 1000 browser viewport and mobile used 390 × 1000; saved images may exclude browser scrollbars. Cart screenshots show the development store’s Sedef Hijab (Mauve). Before images exist for the views captured before edits; a dash denotes no direct before capture.

| View | Before | After |
| --- | --- | --- |
| Collection desktop | [Before](../design/baseline/task-11e/before-collection-desktop.jpg) | [After](../design/baseline/task-11e/collection-desktop.jpg) |
| Collection mobile | — | [After](../design/baseline/task-11e/collection-mobile.jpg) |
| Predictive search desktop | [Before](../design/baseline/task-11e/before-predictive-desktop.jpg) | [After](../design/baseline/task-11e/predictive-desktop.jpg) |
| Predictive search mobile | — | [After](../design/baseline/task-11e/predictive-mobile.jpg) |
| Full search results | [Before](../design/baseline/task-11e/before-search-results.jpg) | [After](../design/baseline/task-11e/search-results.jpg) |
| Cart drawer desktop | [Before](../design/baseline/task-11e/before-cart-drawer-desktop.jpg) | [After](../design/baseline/task-11e/cart-drawer-desktop.jpg) |
| Cart drawer mobile | [Before](../design/baseline/task-11e/before-cart-drawer-mobile.jpg) | [After](../design/baseline/task-11e/cart-drawer-mobile.jpg) |
| Full cart desktop | — | [After](../design/baseline/task-11e/cart-page-desktop.jpg) |
| Full cart mobile | [Before](../design/baseline/task-11e/before-cart-page-mobile.jpg) | [After](../design/baseline/task-11e/cart-page-mobile.jpg) |
| Floating cart mobile | — | [After](../design/baseline/task-11e/floating-cart-mobile.jpg) |

## Verification

- Applied the in-stock collection filter, sorted by ascending price with the filter retained, and followed pagination to page 2.
- Loaded real predictive results for “hijab” on desktop and mobile, exercised Arrow Down and Escape, and submitted to the full results page. The mobile search results used two columns and had no document overflow.
- Added Sedef Hijab in Mauve, saw the line persist after reload, increased the quantity from 1 to 2 (99,00 SEK to 198,00 SEK), and reduced it back to 1. The floating shortcut reflected the change and regained focus after Escape even after Shopify replaced the cart section. Removed the sample item and verified the empty state.
- Verified that the cart page’s native checkout form opened Shopify’s development checkout. No order was placed. The mobile cart measured no horizontal document overflow.
- All ten project validators, Shopify Theme Check, JavaScript syntax checks and `git diff --check` passed. No validator was changed for this task.

## Changed files

- Collection: `sections/collection.liquid`, `assets/collection.css`.
- Search and shared cards: `sections/search.liquid`, `snippets/product-card.liquid`, `assets/product-search.css`.
- Cart surfaces and focus after a section redraw: `sections/cart-drawer.liquid`, `snippets/cart-line-item.liquid`, `assets/cart.css`, `assets/cart.js`.

## Merchant settings and remaining differences

The preview still uses the text store name. Select the existing gold logo in the header settings to review brand alignment. Product photography, titles, variants, price formatting and availability reflect the catalog and market settings. The approved artwork’s sample products and prices were not substituted. The drawer retains the shipping note, remove action and full-cart link for shopping use; the full cart also retains the merchant’s optional order note. Collection density, image ratio, filter layout, predictive options, cart display mode, thumbnails and floating shortcut remain merchant configurable. No translations or schemas changed.

Keyboard dismissal and focus restoration were checked in the storefront. The browser test did not cover a physical mobile keyboard, assistive technology, every merchant color combination, or live Theme Editor reloads. Existing no-JavaScript forms remain in place; a separate JavaScript-disabled run was not performed.
