# SalamShop 2.0 design system

> Historical Task 02 specification. Task 11A's [approved visual design](approved-visual-design.md) is authoritative for current defaults, typography, geometry and surface treatment. Existing merchant setting IDs remain valid.

Task 02 establishes global styling and reusable foundations for Modern Islamic Elegance: warm surfaces, dark legible text, restrained gold accents, refined headings and practical shopping controls. It adds no major sections, dependencies, downloaded font files or storefront JavaScript. Task 03 has not been started.

## Architecture and scope

The existing Skeleton structure is retained. `config/settings_schema.json` owns merchant settings; `snippets/css-variables.liquid` turns settings into CSS tokens and loads fonts through Shopify; `assets/critical.css` supplies the shared foundations. All existing layouts, including password and gift-card layouts, already load these files.

Existing IDs `type_primary_font`, `max_page_width`, `min_page_margin`, `background_color`, `foreground_color` and `input_corner_radius` are preserved. `config/settings_data.json` remains unchanged so saved merchant choices are not overwritten. Defaults apply when no choice is saved. The previous 90rem and 110rem width options remain valid; 80rem is the new default option.

The homepage and header markup, section groups, templates, product data and checkout behavior are unchanged. Collection/search grids receive a narrow-screen sizing correction. The text block consumes the heading tokens. Global typography/colors naturally affect existing pages; the Skeleton demo still has its own local colors and layout until a future homepage task.

## Palette

| CSS token | Default | Use |
| --- | --- | --- |
| `--color-background` | `#F7F3EC` | Warm page canvas |
| `--color-surface` | `#FFFEFB` | Cards, fields and secondary buttons |
| `--color-foreground` | `#252B29` | Text, links and strong field boundaries |
| `--color-button-primary` | `#252B29` | Primary actions |
| `--color-button-primary-text` | `#FFFEFB` | Primary action text |
| `--color-button-secondary` | `#FFFEFB` | Secondary action fill |
| `--color-button-secondary-text` | `#252B29` | Secondary action text/border |
| `--color-accent` | `#C9A76A` | Decorative accent and badge fill |
| `--color-surface-secondary` | `#E7DECF` | Quiet secondary surfaces |
| `--color-border` | `#DED8CD` | Decorative card borders |
| `--color-error` / `--color-error-surface` | `#8A2C24` / `#FFF4F1` | Error text, field borders and error messages |

Brand/surface/button colors are editor settings. Functional error colors are shared tokens rather than additional merchant settings. Gold is not used for small text on a light surface. Links use foreground text and underlines. Decorative borders are intentionally subtle; form controls use the foreground color for a stronger visible boundary.

Default contrast ratios: text on canvas 13.04:1, on surface 14.30:1, on secondary surface 10.81:1, on gold badge fill 6.33:1; primary/secondary button pairs 14.30:1; error pair 7.89:1. These pass WCAG AA normal-text contrast. Merchant color changes must be reviewed again; arbitrary color selections cannot guarantee contrast.

## Typography

The existing `type_primary_font` picker remains the body/control font, with its existing `work_sans_n4` default. The new `type_heading_font` picker defaults to Shopify's supported system `serif` handle. This supplies an elegant serif/sans pairing without guessing a hosted font identifier. The system serif appearance varies by operating system.

Cormorant Garamond and Manrope are visual references, not assumed defaults. A merchant can choose available alternatives in Shopify's font picker. Before approving a different font, inspect its actual available family/variant and Swedish characters `Å Ä Ö å ä ö` in the editor and storefront.

The existing `font_face` / `font_modify` loader remains in use with `font-display: swap`; the selected heading face is also loaded. No third-party font host or unlicensed font file is added. Font family, style and weight come from Shopify font objects, including their fallback families.

| Tokens | Convention |
| --- | --- |
| `--font-body-family`, `--font-body-style`, `--font-body-weight` | Body, prices and controls; aliases retain the original `--font-primary--*` tokens |
| `--font-heading-family`, `--font-heading-style`, `--font-heading-weight` | Headings and text-block title/subtitle styles |
| `--font-size-base` | Editor range 16–20px, emitted in rem; browser root sizing remains untouched |
| `--font-size-small` | 0.875 × base size |
| `--font-size-h1`, `--font-size-h2`, `--font-size-h3` | Fluid `clamp()` sizes with rem endpoints |
| `--line-height-body`, `--line-height-heading`, `--line-height-control` | 1.6, 1.15, 1.25 |

Keep prices and controls in the body family. Use `.price` for tabular numerals. Use semantic headings in new markup; visual size never determines heading level.

## Spacing, widths and borders

`--space-1` through `--space-9` provide a consistent rem scale: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4 and 6rem. Components should consume these tokens instead of adding unrelated pixel values.

`--page-width` uses the existing editor setting (80rem default, with existing 90/110rem options). `--page-margin` grows between the existing minimum gutter and twice that value with `clamp()`. `--content-width-prose` is 65ch.

`--section-spacing` is the editor's total desktop vertical spacing per content section (64px default). Each edge uses `--section-space`: 0.375 × setting on mobile, 0.5 × setting from 48rem. At the default, top/bottom padding is 24px on mobile and 32px on desktop. Header/footer groups are excluded. Avoid nesting `.section` padding inside an already padded section wrapper.

`--grid-item-min` defaults to 16rem; `--grid-gap` is 1.5rem on mobile and 2rem from 48rem. Use `minmax(min(100%, var(--grid-item-min)), 1fr)` so a grid track can shrink on small screens. Section-specific editor gap settings can override the shared gap locally, as the existing collections section does.

`--border-width` and `--border-default` define decorative borders. `--radius-input` aliases the original input-radius token; button/card radius defaults are 4px/8px and remain editable. `--radius-pill` is reserved for badges.

## Theme Editor settings

| Group | Settings |
| --- | --- |
| Typografi / Typography | Existing body font, new heading font, base font size |
| Layout | Existing content width and minimum page margin, section spacing |
| Färger / Colors | Existing background/text colors; surface, secondary surface, gold accent, decorative border |
| Knappar och hörn / Buttons and corners | Primary/secondary background/text pairs; button, card and existing input radius |
| Varumärke / Brand | Original SalamShop logo image picker |

The input-radius setting moves to the controls group without changing its ID or default. All new labels/help text live in `design_system.*` in both schema locales. Existing configuration IDs and stored values remain valid.

There is no original SalamShop logo asset in this repository. The merchant must upload the original unchanged asset using the `logo` image picker. No generated logo, placeholder image or replacement wordmark was added. The existing header is not rewired in this task; a later header task must render `settings.logo` at its natural aspect ratio without recoloring, distortion or redraw. The pre-existing gift-card logo reference can now use this setting.

## Reusable component conventions

The foundations use low-specificity selectors so section styles remain customizable. Only small modifiers use ordinary classes.

| Foundation | Usage |
| --- | --- |
| Primary button | Native `button`, submit/button/reset inputs, or `a.button` for navigation |
| Secondary button | Add `button--secondary` to a native button or `.button` link |
| Fields | Native text/email/password/search/tel/url/number/date inputs, selects, textareas; `.field` for compatible future controls |
| Labels | Native `label`, or `.form-label` where a semantic group label is required |
| Messages | `.form-message`; add `.form-message--error` for errors; Shopify `.errors` output is styled too |
| Product cards | `.product-card`, `.product-card__media`, `.product-card__content`; existing `.collection-product*` classes share the foundation |
| Badges | `.badge`, optionally `.badge--accent` for gold fill with dark text |
| Links | Native links keep underlines; use descriptive translated labels |
| Layout | Existing `.shopify-section` grid and `.full-width`; `.container` for content outside that grid; `.section`, `.stack`, `.grid`, `.prose` for small layout needs |

Example for future section content (inside the existing constrained section grid, without an extra `.container`):

```liquid
<div class="stack">
  <h2>{{ section.settings.heading | escape }}</h2>
  <div class="grid">
    {% for product in section.settings.collection.products %}
      <article class="product-card">
        <div class="product-card__content">
          <h3>{{ product.title | escape | link_to: product.url }}</h3>
          <p class="price">{{ product.price | money }}</p>
        </div>
      </article>
    {% endfor %}
  </div>
</div>
```

This example is a convention, not a new production section. Do not add buttons with fake actions or nested interactive card links. A link navigates; a button performs an action. Use the existing product/cart forms and Shopify routes for actions.

## Accessibility and motion

Controls have a minimum 2.75rem height (44px at the normal root size), wrapping text and bounded widths. New icon buttons must also provide a 44px-wide hit area and an accessible name. Fields need associated labels even when a placeholder exists.

Keyboard focus uses a 2px foreground outline separated by a 3px surface halo. Cards do not clip overflow, so link/button focus rings stay visible. Never remove outlines without a replacement. Mark invalid fields with `aria-invalid="true"`, connect the explanatory text with `aria-describedby`, and use an appropriate live region for asynchronously inserted messages. The CSS does not manufacture ARIA state or validation logic. An `aria-disabled` link still needs its activation prevented in component logic; prefer a native disabled button for unavailable actions.

There are no new animations or smooth scrolling. Reduced-motion rules disable future transitions/animations on foundation classes. Future components must explicitly opt into motion and include a reduced-motion alternative. Do not hide overflow on the page to mask layout defects. Use bounded controls, shrinkable grid tracks and `min-inline-size: 0` on flexible children.

## Future section and localization rules

Continue using JSON templates and section groups. Add editor settings for merchant content, presets for addable sections and reusable theme blocks where content is shared. Keep `block.shopify_attributes`, content-for blocks and dynamic sources working. Choose supported setting types (for example `text`, `richtext`, `image_picker`, `product`, `collection`) so suitable fields can connect to metafields/dynamic sources. Never embed product/collection IDs, fetch merchant data from CSS, or replace dynamic data with theme translations.

Use storefront `t` keys for UI text; use schema `t:` references for editor labels, help, options and presets. Add every key to Swedish and English with matching placeholders and structure. Swedish remains the source language. Merchant product/menu/page content is managed separately. New component styles consume the tokens; add a new global setting only when it supports a real merchant decision.

## Validation and manual verification

```powershell
shopify theme check --output json
git diff --check
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
# Optional local fixture; writes only the named HTML file:
node scripts/validate-design-system.cjs --preview "$env:TEMP/salamshop-design-system.html"
```

The design validator checks unique setting IDs, range bounds/steps, select defaults, default color pairs, setting/token references and all 13 JSON template/group references. Locale validation checks 61 storefront and 82 schema keys per language, including the 21 new schema keys. Theme Check passes with zero issues. Existing template, layout, form and checkout contracts remain intact; no major section or template structure changes were made.

The optional preview embeds the actual CSS and default tokens into fixtures at 320, 390 and 768px. It substitutes system fallback fonts and sample content; it is not a Shopify render or a production page. Browser access to the local HTTP fixture timed out in this session, so visual/mobile/focus verification is still pending. No claim of completed browser QA or live Theme Editor verification is made.

Before a later release, verify the defaults and saved merchant settings in the development Theme Editor, test Swedish glyphs and selected Shopify font downloads, inspect all templates at narrow widths and 200% zoom, and check keyboard focus/invalid/disabled states. Confirm Shopify's hosted payment controls keep their own behavior. The original Skeleton homepage/header remain separate future work. Upload and verify the original logo before production use. No deployment, publication or Git commit is part of this task.

References: [Shopify settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings), [font library and font loading](https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts), [system font handles](https://shopify.dev/docs/storefronts/themes/best-practices/performance/use-system-fonts).
