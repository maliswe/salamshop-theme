# Task 11D — Navigation visual review

Reference: [merchant-approved mockup](../design/reference/salamshop-approved-design.png). Evidence below comes from the local Shopify development preview at `http://127.0.0.1:9292`.

The mockup puts the gold logo at the left, a wide rounded search field at the center, and restrained account and cart icons at the right. The desktop header keeps that two-row composition, with compact category spacing and a soft active indicator. On phones, a cream dock with a fine separator and a beige active tile repeats across the homepage, collections and products. The secondary hamburger menu remains available. The optional tablet rail uses the same links and active treatment.

| Viewport | Navigation |
| --- | --- |
| 320, 375, 390, 430px | Compact header and full-width dock with room for wrapped labels. |
| 768px | Compact header and centered dock; the page retains its full width. |
| 960–1023px | Dock by default. If enabled, the rail replaces it and reserves space at the inline start. |
| 1024, 1280, 1440, 1920px | Desktop header with search and category navigation; no dock or rail. |

In Theme Editor, keep using the header's main menu, logo and logo width, sticky header and search settings. The mobile menu picker and dock visibility remain configurable; the separate tablet rail switch defaults off. The dock takes the first four configured destinations and fills available slots from native Shopify home, catalog, search and account routes (account only when enabled). The preview renders Hem, Kategorier, Contact and Sök. Contact is the merchant's menu title; change it in Shopify Navigation if a Swedish title is preferred.

The exact page link receives `aria-current="page"`; a parent route can be visually active without claiming to be the current page. Links use visible labels and decorative icons. The dock includes safe-area spacing. The sticky purchase action and floating cart use the measured dock height, and the product page reserves extra scroll space when its purchase bar is showing. Mobile search temporarily hides the lower fixed controls. The mobile filter drawer makes background controls inert and restores focus to its trigger on Escape. Shared spacing uses logical properties for direction changes.

| Actual preview capture | Viewport |
| --- | --- |
| [Homepage desktop](../design/baseline/task-11d/home-desktop.jpg) | 1440 × 1000 |
| [Homepage mobile](../design/baseline/task-11d/home-mobile.jpg) | 390 × 1000 |
| [Product mobile](../design/baseline/task-11d/product-mobile.jpg) | 390 × 1000 |
| [Product tablet](../design/baseline/task-11d/product-tablet.jpg) | 1024 × 1000 |
| [Collection desktop](../design/baseline/task-11d/collection-desktop.jpg) | 1440 × 1000 |
| [Collection mobile](../design/baseline/task-11d/collection-mobile.jpg) | 390 × 1000 |
| [Populated cart drawer mobile](../design/baseline/task-11d/cart-drawer-mobile.jpg) | 390 × 1000 |

All ten existing validators passed. Shopify Theme Check reported zero findings. Syntax checks passed for all six JavaScript assets, and `git diff --check` passed. [Measured viewport results](../design/baseline/task-11d/viewport-metrics.json) show no homepage horizontal overflow at the requested widths and at 960px. Preview checks covered predictive search, mobile menu keyboard operation and focus return, mobile search, dock navigation, mobile filter drawer isolation and focus return, collection sorting, product variant selection, sticky Add to Cart, header cart count, floating cart and cart drawer. The test line item was removed afterward. Browser Back returned to the collection; Forward restoration and filter application were not confirmed.

The preview shows a text store-name fallback because no logo is selected. The original logo was not altered; selecting it in the development theme will let the merchant review its size and alignment. Missing campaign photography also limits comparison against the mockup. The tablet rail option, live Theme Editor reloads, text zoom, RTL, reduced motion and assistive-technology behavior beyond the keyboard and DOM checks above remain unverified in the preview.
