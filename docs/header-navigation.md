# SalamShop header and navigation — Task 03

## Architecture

`sections/header.liquid` remains the header section in the existing `header-group` section group. No template or layout changes are needed. The section supplies the announcement, responsive logo, desktop product search, account/cart links, native desktop disclosures and mobile navigation drawer.

`snippets/header-menu.liquid` recursively renders the selected Shopify menu for desktop, mobile and a native fallback. It supports Shopify's nested links (up to three levels). Every parent category has its own destination link at the start of its submenu; expanding a category never navigates away. Active leaf/parent destination links use `aria-current="page"`. IDs include the section, context and ancestor path so repeated menus do not collide.

`snippets/header-search.liquid` uses a standard GET form to `routes.search_url` with `q` and `type=product`. Mobile search links to that native search route. Search does not use predictive requests, a new API or a JavaScript framework. The account link appears only when customer accounts are enabled. Cart accessibility text includes the full server-rendered `cart.item_count`; the visible badge includes zero. No cart mutation or polling is added. Counts update on navigation or Shopify section replacement; a future AJAX cart must rerender the header or explicitly integrate its count updates.

`snippets/header-icon.liquid` contains only decorative utility icons. The existing account/cart SVG assets are reused with an explicit stroke-width token. No branding asset was generated or changed.

`assets/header.css` scopes presentation to the header and consumes the existing design tokens. Local header variables carry merchant widths/background. The section wrapper is sticky when enabled. Desktop navigation wraps rather than scrolling horizontally; its dropdown panels are anchored within the navigation width to avoid viewport-edge overflow. Nested disclosures remain in-flow within the panel. The mobile layout applies below 64rem, including tablets, with bounded logo width and 44px control targets. Logical CSS properties prepare the component for future RTL layouts; an Arabic rollout must also set the document direction and test translated content.

`assets/header.js` registers one `salam-header` custom element. Its lifecycle attaches listeners once and aborts them on disconnection. Newly inserted Theme Editor header markup upgrades automatically after registration. Native menu/search/cart navigation remains independent of JavaScript. No production settings, product data, collections or homepage layout are changed.

## Theme Editor options

Select the header under the header section group. The existing menu setting ID is retained. All new labels/help/default text have Swedish and English schema translations.

| Setting | Behavior/default |
| --- | --- |
| Meny / Menu | Select a Shopify menu; defaults to `main-menu` |
| Fast sidhuvud vid rullning | Sticky header on by default |
| Visa sökfunktion | Show desktop product search and mobile search access; on by default |
| Bakgrund för sidhuvud | Optional override; blank inherits global surface color |
| Logotypens bredd på dator | 80–280px, default 180px |
| Logotypens bredd på mobil | 60–160px, default 100px; shrinks if space is tight |
| Mobilmenyns bredd | Compact (up to 24rem) or full width |
| Visa meddelande | Announcement off by default |
| Meddelandetext | Merchant text; initial localized default is “Välkommen till SalamShop” |
| Länk för meddelande | Optional destination; blank renders plain announcement text |
| Visa meddelande på mobil | On by default; effective when announcement is enabled |

The header can be removed/re-added through its preset, is limited to one instance, and is enabled only in header groups. Global colors, fonts, spacing and the original logo remain in Theme settings. Recheck contrast when overriding the header background, especially controls, focus rings and text.

## Original logo

Upload the original, unchanged gold SalamShop logo under **Temainställningar → Varumärke → SalamShops originallogotyp**. This reuses Task 02's `settings.logo` picker. The image uses its original aspect ratio, responsive widths and eager loading; there is no crop, filter, recoloring, redraw or replacement asset. Alternative text uses the image's alt text, falling back to the shop name.

When the picker is empty, an accessible shop-name text link is shown as requested. This fallback is not a final production logo. No original logo exists in the repository or was selected in the observed development preview, so verification of the real gold asset remains a merchant task.

## Menu setup

In the development store's Shopify admin, open **Content → Menus** (Navigation in some admin layouts). Create or edit the main menu, then select it in the header settings. Links and titles always come from this menu; none of the proposed categories are hardcoded in the theme.

Suggested top-level labels:

- Bönemattor
- Damkläder
- Herrkläder
- Dofter och rökelse
- Koranen och bönetillbehör
- Hem och dekoration
- Personlig vård

Connect these entries to existing destinations as appropriate, and indent child entries to create nested categories. This task does not create, rename or reorganize collections. The observed development menu still contains Shopify's default Home/Catalog/Contact labels. Translate those merchant labels or replace that menu in the admin when ready. Theme locale files do not rewrite merchant navigation data.

For English and Arabic, translate menu titles, announcement content and logo alt text through the store's content translation workflow. Theme UI keys are in `header.*` in storefront locales and `header_settings.*` in schema locales. Existing account/search translations are reused.

## Mobile and keyboard behavior

With JavaScript, the hamburger opens a native modal `dialog`. It has a named menu heading and a visible icon-plus-text close control. Focus moves to that close control; the browser's modal dialog behavior contains focus and makes the background inert. The hamburger's `aria-expanded` reflects drawer state and its `aria-controls` points to the drawer.

Close the drawer with its close control, Escape, or a click on the backdrop. Focus returns to the hamburger. Escape within an expanded nested disclosure first closes that disclosure and focuses its summary; a subsequent Escape closes the drawer. Resizing across the 64rem breakpoint closes the drawer, clears desktop dropdowns and moves drawer focus to the visible brand link. Disconnecting a header closes any open modal and aborts its listeners.

Disclosure summaries work with Enter/Space and ordinary Tab navigation. Arrow Down opens a disclosure and focuses its first destination. Escape closes the nearest open disclosure and returns focus to its summary. Opening one sibling closes the other sibling; clicking or focusing outside the desktop dropdown closes it. These are navigation disclosures, not application menus, so `role="menu"` and menu-item arrow-key expectations are not added.

If JavaScript is disabled, fails to load, or modal dialogs are unsupported, a native mobile `details` navigation remains available. It is nonmodal and can be opened/closed from its summary. All native links/search submission continue to work. Desktop dropdowns also work through native `details`. No hover-only interactions or unnecessary animations are used.

## Validation and testing checklist

Run from the project root:

```powershell
shopify theme check --output json
git diff --check
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node --check assets/header.js
```

Results for this task:

- Theme Check passes with zero errors, warnings or informational issues; baseline also passed.
- Locale validation passes: 69 storefront keys and 101 schema keys per language, with matching keys/placeholders/HTML. This task adds 8 storefront and 19 schema keys, and updates the original-logo setting help text.
- Design-system settings, default contrast, token references and 13 template/group references pass.
- Header validation checks 11 setting IDs/defaults/ranges, logo/search contracts and controller behavior: repeated registration, repeated connection, listener cleanup/reconnection, open/close/cancel/backdrop handling, focus restoration, breakpoint closing, sibling disclosure closing, Escape/Arrow Down and outside click.
- Controller tests use event/element test doubles; they do not prove native focus trapping, CSS layout or real Shopify editor behavior.
- JavaScript syntax and Git whitespace checks pass.
- The desktop header was observed in the already-running development preview at `http://127.0.0.1:9292`: desktop search, account/cart (0), native menu labels and the no-logo fallback rendered.
- In the isolated browser session, submitting product search redirected to Shopify's storefront password gate. Authentication was not automated. End-to-end search and mobile browser verification remain pending.

Before approval for release:

1. Unlock the development storefront in the test browser and submit Swedish search terms; verify the result URL contains `q` and `type=product` and results/empty states render.
2. At 320, 390, 768, 1024 and wide desktop sizes, inspect the header with a long shop name, long translated menu titles and maximum logo widths. Test an empty menu, missing logo and search hidden.
3. Upload the original gold logo and verify its aspect ratio, sharpness, alt text and both width controls.
4. Create a three-level menu fixture in the development admin and verify parent destinations, nested disclosures, current-page states and long-title wrapping. Do not use production for this check.
5. Test mobile open/close, background inertness, Tab/Shift+Tab containment, Escape at each depth, backdrop closing, focus return, scroll lock and resize while open.
6. Verify empty and populated cart counts in a development session, without proceeding to checkout. Test account-enabled/disabled states.
7. In Theme Editor, change each setting and repeatedly reload/re-add the section while the drawer is open. Confirm no duplicate listeners, stale modal or lost page scrolling.
8. Toggle sticky/announcement settings, test mobile announcement visibility and optional link, check keyboard focus and 200% zoom, and test navigation with JavaScript disabled.

No deployment, publication or Git commit was initiated by the agent. The existing user-run development preview was used for observation. Predictive search and homepage redesign remain outside Task 03.

References: [Shopify section architecture](https://shopify.dev/docs/storefronts/themes/architecture/sections), [native dialog behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
