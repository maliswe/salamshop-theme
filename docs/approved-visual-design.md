# Approved SalamShop visual design — Task 11A

## Authority and measurement

Visually inspected `design/reference/salamshop-approved-design.png` (1536 × 1024) on 2026-11-05. This supersedes the general Material 3 direction in `material3-redesign.md`. The image is a composite: a desktop homepage at left, a mobile product screen in the middle, and cart/component studies at right. Its device shells, outer shadows and status bar are presentation framing, not storefront UI. Measurements below are approximate image-pixel observations translated into responsive CSS rules, not claims about the mockup's original source dimensions.

## Layout specification

| Area | Reference observation | Storefront rule |
| --- | --- | --- |
| Grid | Left frame ~744px wide; content ~702px; ~22px inset | Retain configurable 80rem maximum and 20px minimum gutters; avoid nested container padding. Four product columns on wide desktop; two on mobile. |
| Header | Logo/search/actions share one row; centered navigation below; hero starts around y134 | Natural logo ratio; default widths 180px desktop / 100px mobile. 12–16px row padding, 8–16px internal gaps. No permanent header shadow. |
| Search | Quiet beige pill, search icon and compact text | 48px accessible control height; pill shape; no heavy surrounding border. Results float with a restrained shadow. |
| Hero | ~702 × 339 (~2.07:1), rounded 24px; text occupies left half | Preserve editorial image/focal-point controls and readable overlay. Target ~2:1 desktop composition, adapt height to copy on mobile. Do not crop a logo or fabricate imagery. |
| Categories | Seven ~88px image tiles, ~12px gaps; labels below | Rounded image tiles; compact labels and 12–16px gaps. Existing category composition remains for later page-specific milestones. |
| Products | Four ~168 × 139 image areas (~1.2:1), 10–16px gaps; text on canvas | Flat cards, independently rounded 24px media; 12px content inset; dark prices. Retain merchant square/4:5 image ratio choices and contain fit so product details are not cropped. |
| Product gallery | Mobile main image ~326 × 228 (~1.43:1); four thumbnails ~77 × 56 | Rounded 24px main media, ~14px thumbnail corners, 8px thumbnail gaps. Existing natural/square/portrait choices remain; no forced universal crop. |
| Product stack | Breadcrumbs, gallery, thumbnails, title/price, options, CTA, disclosures | Single column on mobile; existing two-column desktop layout. 8–12px related-element gaps, 16–24px group gaps. |
| Cart | ~348px floating card; small thumbnails, hairline separators, full-width pills | Existing drawer/dialog behavior stays; tonal surfaces, rounded container, floating shadow only. Never copy depicted prices or cart contents. |

## Typography and rhythm

Clean sans-serif throughout, with the original logo's lettering unchanged. Default body and heading pickers use Work Sans; headings use its bold face. Retain merchant-selected heading faces. Body 16px/1.5; supporting text 14px; product card titles 14–16px/1.25 and bold; section headings 24–32px/1.15; mobile product title 28px, desktop up to 40px; mobile price 24px; hero 36–56px with ~1.1 leading. Avoid the previous 92px hero and 60px product headline extremes. Keep the existing 4/8/12/16/24/32/48/64px spacing scale. Default section setting stays 64px total desktop, 48px mobile; individual page composition is a later milestone.

## Colors, surfaces and geometry

| Role / setting | Default | Use |
| --- | --- | --- |
| Canvas / `background_color` | `#FFFCF7` | Ivory page background |
| Surface / `surface_color` | `#F3E9DF` | Beige secondary controls and groups |
| Tonal / `secondary_surface_color`, `surface_high_color` | `#E6D5BC` | Stronger tonal grouping |
| Quiet / `surface_low_color` | `#FAF5ED` | Floating panels and quiet information surfaces |
| Primary / `primary_color`, primary button background | `#9A6A22` | Golden-brown actions and selected chips |
| Text / `foreground_color` | `#292720` | Deep warm dark text and prices |
| On primary | `#FFFFFF` | Primary action text |
| Primary container / secondary button | `#F3E9DF` | Quiet secondary actions |
| On container | `#49391E` | Secondary action text |

Default card radius 24px; large container 28px; button and chip pill token 999px. Existing button radius slider's maximum 50px maps to the pill token; smaller saved settings retain their numeric radius. Input radius remains editable at 24px. Icon buttons are circular 48px targets with 20–24px line icons. Selected option chips use primary/on-primary; swatches retain their real Shopify color/image and selected ring. Do not infer colors from option names. Native unavailable and focus states remain distinguishable.

No elevation on product cards or ordinary button hover. Reserve soft warm shadows for search/menu popovers, dialogs, bottom navigation, floating cart and sticky purchase controls. Decorative borders are subtle; controls requiring boundaries and focus must retain accessible contrast. Accordion rows use quiet beige fills, 16–20px horizontal padding, generous hit areas, and a simple open/closed indicator. Current navigation uses a tonal pill plus its existing current-page semantics.

## Responsive behavior and access

At <48rem, retain the compact header, horizontally accessible thumbnails, single-column product details, two-column product lists, wrapping options, safe-area-aware purchase and navigation bars. At 48–63.999rem retain the existing navigation rail; this tablet treatment is an implementation choice because the reference supplies no tablet screen. At >=64rem retain full header navigation. Never shrink touch targets to the mockup's scaled component-study sizes. Preserve 48px controls, visible keyboard outlines, text labels/accessible names, reduced motion and 200% zoom reflow. Do not add wishlist, review or discount UI without actual supported data and behavior.

## Merchant ownership and implementation boundaries

Preserve all existing setting IDs and `config/settings_data.json`. Changes to schema defaults apply only where the merchant has not saved a value. Keep typography, colors, widths/gutters, spacing, radius/shape presets, logo picker, menus, image choices/focal points/ratios, product layout and navigation toggles configurable. Existing compact/soft shape presets continue to work. Use the existing token snippet and component styles; do not append another global override stylesheet. Reuse existing JavaScript and Liquid commerce contracts.

The separate original logo asset is absent locally and the development preview currently displays the shop-name fallback. The reference's gold logo is a visual cue only: do not extract, redraw, recolor or replace it. Verify the merchant's original uploaded asset on the actual ivory/header background when available. Logo legibility cannot be certified from an unavailable source asset; WCAG normal-text ratios apply to functional text and controls, while logo lettering is exempt.

## Baselines, validation and remaining differences

See `approved-visual-validation.md` for actual development-theme captures, automated check results, limitations and the remaining differences. Baselines are the remote theme before these local foundation changes; no uploaded or published after-state is implied. Task 11B is outside this task.
