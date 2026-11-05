# Task 01: Swedish-first localization

Swedish is the theme source locale. English remains available as a secondary locale. No store settings, products, collections, checkout settings, or remote themes were changed. No commit, push, or publication was performed.

## Inspection

Before editing, all theme Liquid files, JSON configuration/templates, locale files and CSS were inspected. There are no JavaScript assets. Both layouts already use `request.locale.iso_code`; these remain unchanged so the document language follows the active locale.

The original locale files contained 32 storefront keys and 58 schema keys. All original English key/value pairs are preserved in the secondary English files. The original schema locale used a trailing comma; its replacement is strict JSON. Shopify Theme Check accepted the original theme with zero issues.

Hardcoded text was found in the product submit button, Skeleton welcome section, metadata title suffixes, and welcome section schema. These now use locale keys. The welcome layout, links and section configuration remain intact. The text block default also uses a schema translation key.

## Changed files

- Replaced `locales/en.default.json` with `locales/en.json` and `locales/sv.default.json`.
- Replaced `locales/en.default.schema.json` with `locales/en.schema.json` and `locales/sv.default.schema.json`.
- `blocks/text.liquid`: translatable default text.
- `sections/article.liquid`: localized pagination, preserving the comments anchor.
- `sections/blog.liquid`: localized pagination.
- `sections/cart.liquid`: localized empty state, continue-shopping link and quantity accessibility label.
- `sections/collection.liquid`: localized pagination and empty state.
- `sections/collections.liquid`: localized empty state.
- `sections/header.liquid`: localized account and cart accessibility labels.
- `sections/hello-world.liquid`: localized existing demo copy and editor labels; decorative image has empty alt text.
- `sections/product.liquid`: localized submit button, sold-out state and variant/quantity accessibility labels.
- `sections/search.liquid`: localized search accessibility label and pagination.
- `snippets/meta-tags.liquid`: localized tag/page title suffixes.
- `templates/gift_card.liquid`: locale-aware expiration date format.
- `scripts/validate-locales.cjs`: dependency-free locale validation and reference inventory.
- `docs/localization.md`: this report.

## Translation counts and review

There are 122 translation keys per language: 61 storefront keys and 61 schema keys. This includes all 90 original keys and 32 additions. Swedish and English have identical key structures. All original interpolation variables are retained. The original files contain no pluralization objects; existing string structures remain unchanged.

No translation keys require a wording decision. Names such as Shopify, Skeleton, Liquid and Apple Wallet are retained intentionally. Text, Layout, Block and Variant are also valid Swedish terms in context.

Product titles, variant titles/options (including size and color), navigation links, articles, pages and shop descriptions come from merchant data. These are not rewritten or guessed by the theme. Shopify supplies platform form-error messages, payment buttons and powered-by text for the active locale; no checkout overrides were added.

## Validation

Run from the project root:

```powershell
node scripts/validate-locales.cjs
node scripts/validate-locales.cjs --inventory
shopify theme check --output json
git diff --check
```

Results:

- All four locale files parse as strict JSON.
- Swedish/English key parity, interpolation and HTML token checks pass.
- All 56 unique storefront and 51 unique schema translation references resolve. The inventory command lists each key and its files. Four retained login keys are currently unused; the date format is consumed by date filters.
- All section/block schema JSON parses.
- All 90 original English values were compared against Git HEAD and match exactly.
- Final Theme Check: valid, zero errors, warnings or informational issues. Baseline also had zero issues.
- No hardcoded English UI text remains in the inspected theme source. Code comments, identifiers, URLs, theme metadata and merchant-provided content are retained.
- A rendered Shopify storefront has **not** been verified. `shopify theme dev` uploads files to a remote development theme, so it was not run under the instruction prohibiting automatic push. Static checks do not prove runtime rendering.

## Next steps

When a development upload is authorized, preview only on `salamshop-development.myshopify.com`. Check Swedish and English product pages, available/sold-out variants, empty/populated carts, search results/empty results, paginated collections/blogs/comments, password errors and gift cards. Confirm Swedish editor labels and English fallback labels.

Confirm Swedish is the development store's default published language and that the relevant editor language is selected; locale files do not change store/account language settings. Publish English later when its merchant content is ready. Arabic will need its own locale files and a separate RTL layout review.

Shopify references: [locale architecture](https://shopify.dev/docs/storefronts/themes/architecture/locales), [schema locale files](https://shopify.dev/docs/storefronts/themes/architecture/locales/schema-locale-files), [pagination labels](https://shopify.dev/docs/api/liquid/filters/default_pagination), [locale-aware dates](https://shopify.dev/docs/api/liquid/filters/date).
