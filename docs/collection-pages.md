# SalamShop collection pages

Task 06 replaces the Skeleton collection list with a Swedish-first, server-rendered Shopify collection experience. It reuses the Task 05 product-card component and the existing global design tokens. No product, variant, inventory, collection, tag, metafield, checkout or production-store data is changed.

## Architecture

- `sections/collection.liquid` owns the collection introduction, product count, sorting, filtering, empty states, product pagination and section settings.
- `snippets/collection-filters.liquid` renders the native `collection.filters` values as GET form controls. Shopify supplies the labels, parameter names, values, counts and active states.
- `snippets/collection-active-filters.liquid` renders Shopify-provided removal URLs plus a clear-all URL that retains the selected sort order.
- `snippets/product-card.liquid` remains the shared homepage/collection card. Collection pages add only real sale and sold-out badges from Shopify product data.
- `assets/product-card.css` contains the shared card presentation previously embedded in the homepage stylesheet.
- `assets/collection.css` contains collection-only layouts and responsive behavior.
- `assets/collection-filters.js` progressively enhances the mobile `<details>` fallback into a modal-style drawer with focus containment, Escape closing, scroll locking and focus restoration.

Filtering and sorting are ordinary GET forms. They continue to work when JavaScript is unavailable and they never hide products client-side. Pagination uses Liquid `paginate`, defaults to 24 products and never loads the full catalog into the DOM.

## Theme Editor options

The main collection section exposes:

- collection image visibility and whether to use the collection's image;
- optional desktop and mobile banner overrides;
- split, image-overlay or text-only introduction layout;
- collection description and product-count visibility;
- filters and sorting visibility;
- sidebar or toolbar filters on desktop;
- three to five desktop product columns;
- 12–48 products per page, default 24;
- portrait or square product media.

The mobile product grid remains two columns to maintain a predictable browsing experience. Collections without images automatically use the compact text-first introduction, with no unrelated placeholder artwork.

## Configure Shopify storefront filters

The theme displays only filters returned by Shopify in `collection.filters`. To choose them in the development store:

1. In Shopify admin, open **Apps > Search & Discovery**.
2. Open **Filters**, then choose **Add filter**.
3. Select a source, optionally rename or group its values, choose its behavior and save.
4. Reorder filters in Search & Discovery if needed.
5. Open a collection in the development theme and verify that only relevant values and counts appear.

Shopify currently supports standard filters such as availability, category, price, product type, tags and vendor, plus compatible product-option, metafield and metaobject filters. Shopify limits stores to 25 configured filters, collection filtering does not display for collections over 5,000 products, and a storefront filter displays at most 100 values. Consult [Shopify's current Search & Discovery filter guide](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters) before changing merchant configuration.

The theme implementation follows Shopify's [Liquid storefront-filtering guidance](https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering/support-storefront-filtering): parameter names and removal URLs come directly from Liquid filter objects rather than hardcoded query conventions.

### Color and size

Color and size appear only when the underlying products have consistent option names/values and the corresponding product-option filters are enabled in Search & Discovery. For example, Sedef Hijab and Islamisk mössa can contribute color values, while Imarat Thobe II can contribute both color and size values. The theme does not create, normalize or translate those catalog options.

Review option spelling and casing in the catalog before enabling the filters. Group equivalent values in Search & Discovery when appropriate. Translate published filter labels and values through Shopify Translate & Adapt before enabling secondary storefront languages. Vendor and tag values have Shopify-specific translation limitations documented in the official filter guide.

## Customer experience

### Desktop

The default sidebar keeps product controls visually separate from the grid. Merchants can switch to a full-width toolbar for collections where horizontal discovery is more useful. Filter groups use native disclosure elements, sorting uses Shopify's available `collection.sort_options`, and all state changes submit to the collection URL.

### Mobile

The filter trigger shows the active-filter count. With JavaScript, it opens a right-side drawer, moves focus to the close button, contains Tab focus, closes on Escape or backdrop/close activation, prevents background scrolling and returns focus to the trigger. Without JavaScript, the same `<details>` element expands in normal document flow and the form remains functional.

Active filters appear as individual removal links outside the drawer as well as inside it. Clear-all retains explicit sorting. Sorting includes active filter parameters as hidden fields. Starting a new filter or sort request intentionally returns to the first result page; Shopify-generated pagination links retain the current query state.

## Product cards and states

- Product image, title, formatted price, compare-at price, availability and sale state all come from Shopify.
- A sale badge appears only when `compare_at_price` is greater than `price`.
- Missing product media uses Shopify's neutral product placeholder.
- Collections with no products offer a route to all products.
- A zero-result filtered collection offers a filter-clearing recovery action.
- Above-the-fold collection images and the first product row are eager; subsequent product imagery is lazy and responsively sized.

## Accessibility

- Breadcrumbs, filter regions, result status and pagination have explicit accessible names.
- Filter groups use native `<details>`/`<summary>`; values use labelled checkboxes and disabled states.
- Price inputs have visible labels, numeric bounds and decimal input modes.
- The mobile drawer has a labelled dialog region, close control, Escape behavior, focus containment and restoration.
- Sorting is a labelled native `<select>` with an explicit submit button.
- Global focus rings and minimum control sizes remain in effect.
- The interface does not introduce horizontal carousels or hover-only actions, and shared card motion respects reduced-motion preferences.

## Validation

Run from the theme root:

```powershell
shopify theme check --output json
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node scripts/validate-search.cjs
node scripts/validate-homepage.cjs
node scripts/validate-collection.cjs
node --check assets/collection-filters.js
git diff --check
```

The collection validator checks schema and template defaults, native filter/sort parameter usage, active removal URLs, pagination, shared card state, responsive CSS, no hardcoded catalog/filter data, and the real drawer controller's registration, focus, Tab, Escape and disconnect behavior.

## Browser verification checklist

- 320 px and 390 px: two product columns, no horizontal overflow, drawer close/backdrop/Escape/Tab behavior, stacked price fields at the narrowest breakpoint.
- 768 px: two-column grid, in-flow mobile filter fallback/enhancement and readable introduction.
- 1024 px and 1440 px: configured desktop columns, sidebar and toolbar variants, compact introduction/banner crop.
- Apply availability, color, size, vendor, product-type, price and metafield filters that are actually configured in Search & Discovery.
- Remove one active filter, clear all, then confirm explicit sorting remains.
- Change every Shopify-provided sort option and verify filter query parameters remain.
- Visit a collection with more than one result page and verify previous/next/page links retain filtering and sorting.
- Verify unfiltered empty, filtered empty, missing collection image and missing product-image states.
- Disable JavaScript and confirm filters, sorting and pagination submit normally.
- Verify keyboard order and screen-reader announcements with NVDA/VoiceOver.

## Known limitations

- Visible filters and counts depend entirely on Search & Discovery configuration and Shopify's indexed catalog state; repository code cannot create them.
- Visual filter swatches/images require Shopify filter-value API presentation work beyond the text/checkbox UI in this task. Color filtering itself works as a native text filter when configured.
- The development store must contain a collection with more than 24 matching products to exercise multi-page pagination end to end.
- Automated tests cover generated structure and drawer behavior, but not actual assistive-technology speech or a physical mobile keyboard.
- Merchant banner crops, filter naming/grouping, collection descriptions and translations still require manual visual/content review.
