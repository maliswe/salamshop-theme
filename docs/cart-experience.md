# Cart experience

SalamShop uses Shopify's native Liquid cart, locale-aware Ajax Cart API and bundled section rendering. No price, discount, inventory or checkout decision is calculated in the browser.

## Architecture

- `sections/cart-drawer.liquid` is part of the header group and loads the shared cart controller.
- `sections/cart.liquid` is the complete `/cart` experience and retains a native Shopify cart form.
- `snippets/cart-line-item.liquid` renders the same server-owned line data in the drawer and cart page.
- Header count, drawer and cart page expose their real section IDs through `data-cart-section`.
- `assets/cart.js` requests those IDs with each mutation and replaces only matching server-rendered targets.

The product controller intercepts only the standard Add to cart submit when drawer behavior is enabled. Accelerated checkout is not intercepted. Drawer-disabled mode, JavaScript-disabled browsing and a retry after an ambiguous network failure use the native product form.

## Ajax endpoints

URLs come from Shopify's `routes` object and therefore retain the active storefront locale:

- `routes.cart_add_url + '.js'` for product-form additions.
- `routes.cart_change_url + '.js'` for a single line quantity or removal.
- `routes.cart_url + '.js'` only as a final count-recovery request.

Cart changes send the line item's full `item.key`, not only its variant ID. Product properties and selling plans remain distinct. A mutation requests all visible cart section IDs plus `sections_url`. If bundled markup is missing or null, the controller performs a Section Rendering GET; it never repeats the mutation.

## Drawer behavior and accessibility

The cart icon remains a link to `/cart`. In drawer mode JavaScript progressively enhances it into a native modal dialog. Escape, backdrop, visible close and Continue shopping close the drawer. Initial focus moves to the close control and returns to the cart trigger. Native dialog semantics provide focus containment, while the existing `scroll-lock` rule prevents background scrolling.

Quantity buttons, manual inputs and remove links are keyboard accessible. Changes for each line are serialized so rapid input cannot let an older response overwrite a newer intent. Status and error regions announce meaningful results without duplicating every price change.

## Cart page and checkout

The cart page renders product images, titles, selected options, public line properties, selling plans, Shopify-provided line discounts, cart discounts and totals. Property names beginning with `_` remain private. The native `name="checkout"` submit hands the existing cart to Shopify checkout; the theme does not implement or customize payment.

Order notes are optional. An unsaved note is preserved while Ajax quantity updates rerender the page, and is submitted by the native Update cart or Checkout control.

## Theme Editor settings

Theme settings → Cart controls:

- Drawer or cart-page behavior.
- Continue-shopping URL and empty-cart collection.
- Empty-state copy and button label.
- Order note, thumbnails and variant details.
- Comfortable or compact cart-page spacing.

## Validation

```powershell
node --check assets/cart.js
node --check assets/product.js
node scripts/validate-cart.cjs
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node scripts/validate-search.cjs
node scripts/validate-homepage.cjs
node scripts/validate-collection.cjs
node scripts/validate-product.cjs
shopify theme check
git diff --check
```

## Manual checklist

In the development store only, add different variants of Sedef Hijab, an available Islamisk mössa and a valid Imarat Thobe II combination. Confirm separate lines, properties, selling plans, sold-out errors, quantities, removal, totals, persistence, empty state, drawer keyboard behavior and the handoff to Shopify checkout without placing an order. Test drawer and page modes, JavaScript disabled, and widths 320, 390, 768, 1024 and 1440 pixels.

Store password protection and accelerated-payment availability can vary by preview session. Neither is bypassed by the theme.
