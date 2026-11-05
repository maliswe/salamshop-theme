# SalamShop homepage

Task 05 replaces the Skeleton landing page with a Swedish-first, merchant-configurable Online Store 2.0 homepage. It uses the existing global tokens, logo, header, search and locale architecture. No product, collection, checkout or production-store data is changed.

## Architecture

`templates/index.json` composes seven independent sections in this order:

1. `home-hero` — editorial hero with separate desktop/mobile images, two optional actions, alignment, position, height, overlay and text-colour controls.
2. `home-categories` — repeatable collection blocks with collection picker, image override and label override. The initial template contains seven unassigned blocks for SalamShop's category structure; the merchant must select the real collections.
3. `home-featured-products` — collection-driven product grid with product limit, mobile/desktop columns, image ratio and optional “Visa alla” link.
4. `home-editorial` — image/text campaign module with image side, background and button-style controls.
5. `home-new-arrivals` — a second collection-driven product grid using the same card component.
6. `home-brand-values` — repeatable image/icon, title and description blocks. Its initial template instance is disabled until SalamShop supplies and approves the claims.
7. `home-newsletter` — Shopify `customer` form with the `newsletter` tag, a labelled required email field, native validation errors and a localized success message.

Each section has a localized preset, so it can be added, removed, reordered and configured in the Theme Editor. `snippets/product-grid.liquid` and `snippets/product-card.liquid` keep product presentation consistent between the two homepage product sections. `assets/homepage.css` loads only on the index template.

## Merchant setup

- Hero: upload a landscape desktop image and, if the crop does not work on a narrow screen, a portrait mobile image. Add useful alt text to source images in Shopify Files when the photograph conveys information; the hero image is treated as decorative because the adjacent copy communicates the section purpose.
- Categories: assign each of the seven existing collections. A block without a collection intentionally remains a non-clickable placeholder. Add image overrides only when the collection image is unsuitable.
- Product sections: assign the desired collections. Unassigned sections show editor-friendly placeholders and never invent products or links.
- Editorial: replace the placeholder and copy with an approved campaign or story, then verify the selected link.
- Brand values: enter only claims that SalamShop can substantiate, then enable the section. Do not add invented delivery promises, guarantees, certifications or religious endorsements.
- Newsletter: confirm the wording and submit a test address in the development store. The form uses Shopify customer records and no external integration.

Routine copy and images are section settings, so merchants do not need to edit Liquid. Theme-setting text is translatable through Shopify's normal translation workflow. The supplied `index.json` copy is Swedish-first initial content and can be translated with Shopify Translate & Adapt before English or Arabic launches.

## Image recommendations

| Placement | Suggested source | Crop guidance |
| --- | --- | --- |
| Hero desktop | At least 2000 px wide | Landscape, with clear negative space behind copy |
| Hero mobile | At least 960 px wide | Portrait, keeping the subject clear of the text area |
| Category | At least 1200 px on the long edge | Strong single subject; edge-to-edge crop |
| Editorial | At least 1600 px on the long edge | Editorial portrait or balanced landscape |
| Product | Shopify product media | Transparent or clean background works best |
| Value icon image | At least 160 × 160 px | Simple square image; displayed as a circle |

The original SalamShop logo is not touched by these sections.

## Performance decisions

- Only the hero image is eager and high priority. Below-the-fold category, editorial, product and value images are lazy loaded.
- Shopify image filters provide bounded widths and responsive `srcset`/`sizes` data.
- Media containers have fixed aspect ratios or minimum heights to reduce layout shift.
- The homepage adds no JavaScript or third-party dependency.
- Motion is limited to small image-scale transitions and is removed when the visitor requests reduced motion.
- The dedicated stylesheet is conditional on `template.name == 'index'`.

## Accessibility

- Every visible section has a heading and labelled landmark in the default composition.
- Product and category cards use native links with visible global focus indicators; unassigned category placeholders are not fake links.
- Decorative editorial imagery uses empty alt text. Product images fall back to the product title when media alt text is absent.
- Controls keep the global 44 px minimum target size and do not create keyboard traps or horizontal carousels.
- Newsletter input, errors and success feedback are explicitly associated and announced.
- Layouts reflow at 48 rem and remain usable at 320 px without intentional horizontal scrolling.

## Validation

Run from the theme root:

```powershell
shopify theme check --output json
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node scripts/validate-search.cjs
node scripts/validate-homepage.cjs
git diff --check
```

`validate-homepage.cjs` checks all seven section schemas and presets, JSON composition, the seven category blocks, shared product cards, required merchant controls, the native Shopify newsletter contract, responsive-image hooks, the lack of horizontal scrolling and reduced-motion support.

## Browser verification checklist

- Desktop: hero crop, readable overlay, heading hierarchy, category mosaic, four/five-column options, editorial image side, newsletter submission.
- 768 px tablet: category and product grids, action wrapping, text line lengths.
- 390 px and 320 px mobile: optional mobile hero source, two/one-column product choices, touch targets, no clipped copy or horizontal overflow.
- Keyboard: tab through every card and action; focus must remain visible and order must follow the page.
- Reduced motion: enable the OS/browser preference and confirm image transitions are removed.
- Theme Editor: add/remove/reorder every section, add category/value blocks, switch collections, change image positions/backgrounds, and ensure live updates do not affect header/search.
- Localization: review English merchant labels and translate all merchant-authored homepage content before enabling the English storefront.

## Known limitations

- Repository code cannot select the store's real collections or campaign photography; those choices require merchant setup.
- Initial category labels are visible placeholders until collections are assigned. They deliberately contain no hardcoded handles or IDs.
- Brand values are disabled by default because no approved merchant claims were supplied.
- Newsletter delivery and customer creation depend on the development store configuration and require a manual submission test.
- Placeholder rendering is safe for an unconfigured theme but is not a substitute for final photography and collection assignment.
