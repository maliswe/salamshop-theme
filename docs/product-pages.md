# Product pages

SalamShop's product template is Shopify-native and Swedish-first. It does not duplicate catalog data or preload every variant.

## Product data

The product form posts directly to Shopify. The selected variant ID and quantity are shared by the main add-to-cart button, accelerated checkout and the mobile sticky button. Option choices use `product.options_with_values`; changing a value requests the section again with Shopify's `option_values` parameter. This supports products above the 250-variant Liquid limit and combined listings. Every value is also a real variant link, so the initial selection and purchasing path remain usable if JavaScript is unavailable.

The gallery supports images, hosted video, external video and 3D models from `product.media`. Images use responsive sources and non-primary media load lazily. Image zoom uses a native dialog.

## Metafields

Create product metafield definitions in namespace `custom` with these keys:

- `material`: text, rich text, list or another type supported by `metafield_tag`.
- `langd`: dimension or text.
- `bredd`: dimension or text.
- `tvattrad`: multi-line text or rich text.
- `huvudomkrets`: dimension or text.
- `storleksguide`: preferably a page reference; rich text is also supported.

Empty metafields are not rendered. The corresponding theme-editor blocks control visibility and order. A page selected in the Size guide block overrides `custom.storleksguide`. Its “option name” must match the product option apart from capitalization, normally `Storlek` in Swedish or `Size` in English.

## Recommendations

The Product recommendations section calls Shopify's locale-aware Product Recommendations endpoint with `intent=related`. It renders nothing when Shopify returns no products and reuses the shared product card. Merchants can tune results in Shopify Search & Discovery.

## Merchant controls

The main product section controls image ratio, thumbnail position, zoom, vendor, tax note, quantity, accelerated checkout, sticky desktop information and the mobile sticky buy bar. Information blocks can be reordered. Recommendations control heading, count, columns and image ratio.

## Validation

Run:

```powershell
node scripts/validate-product.cjs
node scripts/validate-locales.cjs
shopify theme check
```

Before publishing, preview representative products with no variants, sold-out variants, sale pricing, missing metafields, long Swedish text, mixed media and many option values. Verify add-to-cart and accelerated checkout in the development store only.
