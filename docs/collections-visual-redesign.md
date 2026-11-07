# Collections visual redesign

## Scope and design

The collection directory and collection listings follow the current homepage's ivory surfaces, tonal controls, rounded photography and compact gold product-page actions. Colors, contrast pairs, radii, shadows and focus indicators come from the existing global Theme Editor tokens. No catalog, logo, checkout or production changes are included.

## Collection directory

`sections/collections.liquid` retains Shopify's collection enumeration and real URLs, paginated at 24 collections. The heading defaults to “Utforska våra kategorier”; an optional rich-text description is editable. Category cards show the collection name, optional product count, existing description and a gold discovery cue. The entire card is one link with a visible keyboard focus outline.

Photography uses `collection.image`, with optional section blocks pairing a collection picker and image override. Images are requested without server-side cropping. Cover and contain are supported inside landscape 4:3, square or portrait 4:5 media. Missing photographs produce tonal text-first cards, without stock or product-image substitutions.

The dedicated `collection-directory.css` avoids the double page gutters previously introduced by `secondary-page`. Existing secondary-page styles remain unchanged for other routes.

## Shared product cards

Collection listings render the existing `product-card` snippet with the same premium opt-in used by the homepage (`homepage_card: true`, legacy class `home-product-card--homepage`). The premium rules moved from `homepage.css` into `product-card.css`; collection-only card markup was not created. Search and recommendations retain their opt-out presentation.

Prices, variable-price labels, compare-at prices, sale and sold-out badges still use actual Shopify product data. “Köp nu” links to the product page, allowing variant selection; no new add-to-cart flow was introduced. Both surfaces use the same image-fit, description, button-style and spacing controls. Computed desktop styles matched for card surface, radius, shadow, content padding, title/price typography, image fit and button appearance.

## Responsive layout

- Directory: one column below 480px for long Swedish category names, two from 480px, three from 1024px; compact density enables four from 1200px.
- Listings: one column at narrow 320px, two on mobile/tablet, then three/four/five according to the configured count and actual results-container width. Container queries avoid squeezing four cards beside the filter sidebar.
- Mobile/tablet controls place count/filter above a flexible sort row. The existing native details fallback and enhanced filter drawer remain intact. Drawer corners follow the theme radius tokens.
- The drawer and product actions retain comfortable touch targets. Keyboard focus remains visible; card transitions respect reduced motion.

## Theme Editor controls

Directory settings: heading, description, image visibility, product-count visibility, image ratio, cover/contain, grid density (existing `grid_item_width` identifier) and grid gap. Repeatable image-override blocks select an actual collection and image.

Listings retain banner visibility, collection image/custom desktop and mobile images, split/overlay/text introduction, description/count, filter visibility, sorting, sidebar/toolbar choice, columns, page size and media ratio. Added controls reuse homepage translations for product image fit, short description, filled/tonal button and comfortable/compact card spacing. Banner image fit is also configurable. Existing template settings were preserved; temporary test profiles were restored.

## Verification evidence

Local development preview: `http://127.0.0.1:9292`.

`design/collections-redesign/verification.json` records directory and listing measurements at 320, 390, 768, 1024, 1440 and 1920px. Neither route had horizontal overflow. Genuine product cards retained matching product/CTA URLs and 44px CTA heights.

Browser checks:

- Directory: eight real collection links, pluralized counts, keyboard card focus, one/two/three-column responsive layouts and missing-photo fallback.
- `/collections/all`: 24 cards per page, genuine sale/sold-out badges and three-page pagination. Availability “I lager” returned 65 products; page two preserved the filter and rendered 24 cards.
- Sorting by price ascending preserved availability and reset pagination. Adding a 100 SEK maximum retained sorting and availability, returned 24 products and displayed active removal links.
- Mobile drawer: modal semantics, background isolation, Shift+Tab/Tab focus wrap, Escape closure and trigger focus restoration passed.
- `/collections/bonemattor`: actual collection title/description and 15 products; desktop/mobile screenshots captured. A zero price maximum produced the filtered empty state.
- `/collections/dofter-och-rokelse`: genuine empty collection state.
- Temporary collection profile: contain, compact spacing, tonal CTA and real short descriptions rendered correctly, without overflow; original template restored afterward.
- Homepage and collection card computed appearance matched directly at 1440px.

Screenshots include `directory-1440.jpg`, `directory-390.jpg`, `bonemattor-1440.jpg`, `bonemattor-390.jpg`, `active-filters-1440.jpg`, `filter-drawer-390.jpg`, `homepage-card-comparison-1440.jpg`, and the contain/empty-state checks.

All existing validation scripts, JavaScript syntax checks, Shopify Theme Check and `git diff --check` pass. The collection validator adds checks for shared-card reuse, directory controls, native URLs and missing-image behavior. The launch-readiness asset assertion now verifies the dedicated directory stylesheet instead of the old secondary stylesheet; its other assertions remain intact.

## Remaining merchant setup

No collections currently have configured collection photography in the development preview. Supply collection images or section image overrides to display editorial media and visually review those crops. Existing product photos were used for listing verification; no catalog imagery was altered.

Only availability and price filters are exposed by the development store. Size/color filters will appear through the unchanged native `collection.filters` loop when configured in Shopify Search & Discovery. Directory pagination beyond 24 collections and image-based banner/override variants could not be exercised against the current eight image-free collections. New Theme Editor controls are schema/locale validated; no Shopify admin settings were saved.

No commit, push, deploy or publication was performed.
